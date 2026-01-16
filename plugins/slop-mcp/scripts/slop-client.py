#!/usr/bin/env python3
"""
slop-client.py - CLI client for SLOP REST API
"""

import argparse
import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


class SlopClient:
    """Simple SLOP REST client."""

    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url.rstrip("/")

    def _request(self, method: str, endpoint: str, data: dict | None = None) -> dict:
        """Make HTTP request to SLOP server."""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}

        body = json.dumps(data).encode() if data else None
        req = Request(url, data=body, headers=headers, method=method)

        try:
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except HTTPError as e:
            error_body = e.read().decode()
            try:
                return json.loads(error_body)
            except json.JSONDecodeError:
                return {"error": {"code": e.code, "message": error_body}}
        except URLError as e:
            return {"error": {"code": -1, "message": str(e.reason)}}

    def info(self) -> dict:
        """Get server info."""
        return self._request("GET", "/info")

    def list_tools(self, query: str | None = None, server: str | None = None) -> dict:
        """List available tools."""
        params = []
        if query:
            params.append(f"q={query}")
        if server:
            params.append(f"server={server}")
        endpoint = "/tools"
        if params:
            endpoint += "?" + "&".join(params)
        return self._request("GET", endpoint)

    def call_tool(self, tool: str, arguments: dict) -> dict:
        """Execute a tool."""
        return self._request("POST", "/tools", {
            "tool": tool,
            "arguments": arguments,
        })

    def list_resources(self, query: str | None = None) -> dict:
        """List available resources."""
        endpoint = "/resources"
        if query:
            endpoint += f"?q={query}"
        return self._request("GET", endpoint)

    def read_resource(self, uri: str) -> dict:
        """Read a resource."""
        return self._request("POST", "/resources", {"uri": uri})

    def get_memory(self, key: str | None = None) -> dict:
        """Get memory entries."""
        endpoint = "/memory"
        if key:
            endpoint += f"?key={key}"
        return self._request("GET", endpoint)

    def set_memory(self, key: str, value: any) -> dict:
        """Set memory entry."""
        return self._request("POST", "/memory", {"key": key, "value": value})


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="SLOP CLI Client")
    parser.add_argument("--url", default="http://localhost:8080", help="SLOP server URL")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")

    subparsers = parser.add_subparsers(dest="command", help="Command")

    # info
    subparsers.add_parser("info", help="Get server info")

    # tools
    tools_parser = subparsers.add_parser("tools", help="List tools")
    tools_parser.add_argument("-q", "--query", help="Search query")
    tools_parser.add_argument("-s", "--server", help="Filter by server")

    # call
    call_parser = subparsers.add_parser("call", help="Call a tool")
    call_parser.add_argument("tool", help="Tool name (server.tool)")
    call_parser.add_argument("args", nargs="*", help="Arguments (key=value or JSON)")

    # resources
    res_parser = subparsers.add_parser("resources", help="List resources")
    res_parser.add_argument("-q", "--query", help="Search query")

    # read
    read_parser = subparsers.add_parser("read", help="Read a resource")
    read_parser.add_argument("uri", help="Resource URI")

    # memory get
    mem_get_parser = subparsers.add_parser("memory-get", help="Get memory")
    mem_get_parser.add_argument("-k", "--key", help="Memory key")

    # memory set
    mem_set_parser = subparsers.add_parser("memory-set", help="Set memory")
    mem_set_parser.add_argument("key", help="Memory key")
    mem_set_parser.add_argument("value", help="Value (JSON)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    client = SlopClient(args.url)

    # Execute command
    if args.command == "info":
        result = client.info()

    elif args.command == "tools":
        result = client.list_tools(args.query, args.server)

    elif args.command == "call":
        # Parse arguments
        tool_args = {}
        for arg in args.args:
            if "=" in arg:
                key, value = arg.split("=", 1)
                # Try to parse as JSON
                try:
                    value = json.loads(value)
                except json.JSONDecodeError:
                    pass
                tool_args[key] = value
            else:
                # Assume it's JSON
                try:
                    tool_args = json.loads(arg)
                except json.JSONDecodeError:
                    print(f"Invalid argument: {arg}")
                    sys.exit(1)
        result = client.call_tool(args.tool, tool_args)

    elif args.command == "resources":
        result = client.list_resources(args.query)

    elif args.command == "read":
        result = client.read_resource(args.uri)

    elif args.command == "memory-get":
        result = client.get_memory(args.key)

    elif args.command == "memory-set":
        try:
            value = json.loads(args.value)
        except json.JSONDecodeError:
            value = args.value
        result = client.set_memory(args.key, value)

    else:
        parser.print_help()
        sys.exit(1)

    # Output
    if args.json or "error" in result:
        print(json.dumps(result, indent=2))
    else:
        # Pretty print based on command
        if args.command == "info":
            print(f"SLOP Server: {args.url}")
            if "servers" in result:
                print(f"Servers: {len(result['servers'])}")
                for s in result["servers"]:
                    status = "✓" if s.get("status") == "running" else "○"
                    print(f"  {status} {s['name']}")

        elif args.command == "tools":
            tools = result.get("tools", [])
            print(f"Tools ({len(tools)}):")
            for tool in tools:
                print(f"  {tool['name']}")
                if tool.get("description"):
                    print(f"    {tool['description'][:60]}...")

        elif args.command == "call":
            if "result" in result:
                print(json.dumps(result["result"], indent=2))
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "resources":
            resources = result.get("resources", [])
            print(f"Resources ({len(resources)}):")
            for res in resources:
                print(f"  {res['uri']}")

        else:
            print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
