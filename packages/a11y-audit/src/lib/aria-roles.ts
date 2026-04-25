/**
 * Static catalog of WAI-ARIA 1.2 role metadata for the aria_validate tool.
 *
 * Each entry describes one concrete (non-abstract) role:
 *   - `role`:                role name (lowercase string used in `role="…"`)
 *   - `required`:            ARIA properties/states required for the role
 *   - `supported`:           ARIA properties/states explicitly supported
 *                            (does not include the global aria-* set; those
 *                             are validated separately as globals)
 *   - `prohibited`:          ARIA properties/states forbidden on the role
 *                            (typically aria-label / aria-labelledby /
 *                             aria-roledescription on roles whose name comes
 *                             from contents)
 *   - `implicit_role_tags`:  HTML tag names whose default role equals this
 *                            ARIA role. Used to flag `redundant-role` when
 *                            the author writes `role="button"` on `<button>`.
 *                            Conditional implicit roles (e.g. `<a href>` →
 *                            `link`) are handled in the validator.
 *
 * Source: WAI-ARIA 1.2 (W3C Recommendation, June 2023) — § Definition of Roles
 * and § HTML Accessibility API Mappings 1.0 implicit-role rules. Abstract roles
 * (`command`, `composite`, `input`, `landmark`, `range`, `roletype`, `section`,
 * `sectionhead`, `select`, `structure`, `widget`, `window`) are intentionally
 * excluded because authors must not use them.
 */

export interface AriaRoleSpec {
  role: string;
  required: readonly string[];
  supported: readonly string[];
  prohibited: readonly string[];
  implicit_role_tags: readonly string[];
}

/**
 * "Name from author" / "name from contents" prohibition: roles where the
 * accessible name MUST come from contents may not carry aria-label or
 * aria-labelledby. Listed roles per ARIA 1.2 § 5.2.8.5 / § 5.2.8.6.
 */
const PROHIBITED_NAME_FROM_CONTENTS = ['aria-label', 'aria-labelledby'] as const;

export const ARIA_ROLES: readonly AriaRoleSpec[] = [
  // --- Widget roles ---------------------------------------------------------
  {
    role: 'button',
    required: [],
    supported: ['aria-expanded', 'aria-pressed', 'aria-haspopup', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: ['button'],
  },
  {
    role: 'checkbox',
    required: ['aria-checked'],
    supported: ['aria-readonly', 'aria-required', 'aria-invalid', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'gridcell',
    required: [],
    supported: ['aria-readonly', 'aria-required', 'aria-selected', 'aria-rowindex', 'aria-colindex', 'aria-rowspan', 'aria-colspan'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'link',
    required: [],
    supported: ['aria-expanded', 'aria-haspopup', 'aria-disabled'],
    prohibited: [],
    // <a> and <area> are link only when href is present; handled in validator.
    implicit_role_tags: [],
  },
  {
    role: 'menuitem',
    required: [],
    supported: ['aria-expanded', 'aria-haspopup', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'menuitemcheckbox',
    required: ['aria-checked'],
    supported: ['aria-disabled', 'aria-posinset', 'aria-setsize'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'menuitemradio',
    required: ['aria-checked'],
    supported: ['aria-disabled', 'aria-posinset', 'aria-setsize'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'option',
    required: [],
    supported: ['aria-selected', 'aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'progressbar',
    required: [],
    supported: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext'],
    prohibited: [],
    implicit_role_tags: ['progress'],
  },
  {
    role: 'radio',
    required: ['aria-checked'],
    supported: ['aria-posinset', 'aria-setsize', 'aria-disabled', 'aria-required'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'scrollbar',
    required: ['aria-controls', 'aria-valuenow'],
    supported: ['aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'searchbox',
    required: [],
    supported: ['aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required', 'aria-disabled', 'aria-invalid'],
    prohibited: [],
    // <input type="search"> with no list attr; handled conditionally.
    implicit_role_tags: [],
  },
  {
    role: 'separator',
    required: [],
    supported: ['aria-orientation', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: ['hr'],
  },
  {
    role: 'slider',
    required: ['aria-valuenow'],
    supported: ['aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-disabled', 'aria-readonly'],
    prohibited: [],
    // <input type="range"> handled conditionally.
    implicit_role_tags: [],
  },
  {
    role: 'spinbutton',
    required: [],
    supported: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-required', 'aria-readonly', 'aria-disabled'],
    prohibited: [],
    // <input type="number"> handled conditionally.
    implicit_role_tags: [],
  },
  {
    role: 'switch',
    required: ['aria-checked'],
    supported: ['aria-readonly', 'aria-required', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'tab',
    required: [],
    supported: ['aria-selected', 'aria-expanded', 'aria-posinset', 'aria-setsize', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'tabpanel',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'textbox',
    required: [],
    supported: ['aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required', 'aria-disabled', 'aria-invalid'],
    prohibited: [],
    // <input type="text"|email|tel|url> and <textarea> handled conditionally.
    implicit_role_tags: ['textarea'],
  },
  {
    role: 'treeitem',
    required: [],
    supported: ['aria-checked', 'aria-expanded', 'aria-selected', 'aria-disabled', 'aria-posinset', 'aria-setsize', 'aria-level'],
    prohibited: [],
    implicit_role_tags: [],
  },

  // --- Composite widget roles ----------------------------------------------
  {
    role: 'combobox',
    required: ['aria-expanded'],
    supported: ['aria-controls', 'aria-activedescendant', 'aria-autocomplete', 'aria-readonly', 'aria-required', 'aria-disabled', 'aria-haspopup'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'grid',
    required: [],
    supported: ['aria-multiselectable', 'aria-readonly', 'aria-rowcount', 'aria-colcount', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'listbox',
    required: [],
    supported: ['aria-multiselectable', 'aria-readonly', 'aria-required', 'aria-orientation', 'aria-activedescendant', 'aria-disabled', 'aria-invalid'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'menu',
    required: [],
    supported: ['aria-orientation', 'aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'menubar',
    required: [],
    supported: ['aria-orientation', 'aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'radiogroup',
    required: [],
    supported: ['aria-readonly', 'aria-required', 'aria-orientation', 'aria-activedescendant', 'aria-disabled', 'aria-invalid'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'tablist',
    required: [],
    supported: ['aria-orientation', 'aria-multiselectable', 'aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'tree',
    required: [],
    supported: ['aria-multiselectable', 'aria-required', 'aria-orientation', 'aria-activedescendant', 'aria-disabled', 'aria-invalid'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'treegrid',
    required: [],
    supported: ['aria-multiselectable', 'aria-readonly', 'aria-required', 'aria-orientation', 'aria-rowcount', 'aria-colcount', 'aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },

  // --- Document structure roles --------------------------------------------
  {
    role: 'application',
    required: [],
    supported: ['aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'article',
    required: [],
    supported: ['aria-posinset', 'aria-setsize'],
    prohibited: [],
    implicit_role_tags: ['article'],
  },
  {
    role: 'blockquote',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['blockquote'],
  },
  {
    role: 'caption',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['caption'],
  },
  {
    role: 'cell',
    required: [],
    supported: ['aria-rowindex', 'aria-colindex', 'aria-rowspan', 'aria-colspan'],
    prohibited: [],
    // <td> only when descendant of <table> with table role; conditional.
    implicit_role_tags: [],
  },
  {
    role: 'code',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['code'],
  },
  {
    role: 'columnheader',
    required: [],
    supported: ['aria-sort', 'aria-readonly', 'aria-required', 'aria-selected', 'aria-rowindex', 'aria-colindex', 'aria-rowspan', 'aria-colspan', 'aria-expanded'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'definition',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['dd'],
  },
  {
    role: 'deletion',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['del'],
  },
  {
    role: 'directory',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'document',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'emphasis',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['em'],
  },
  {
    role: 'feed',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'figure',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['figure'],
  },
  {
    role: 'generic',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['div', 'span'],
  },
  {
    role: 'group',
    required: [],
    supported: ['aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: ['fieldset'],
  },
  {
    role: 'heading',
    required: ['aria-level'],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  },
  {
    role: 'img',
    required: [],
    supported: [],
    prohibited: [],
    // <img alt=…> is implicit img; handled conditionally.
    implicit_role_tags: [],
  },
  {
    role: 'insertion',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['ins'],
  },
  {
    role: 'list',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['ul', 'ol'],
  },
  {
    role: 'listitem',
    required: [],
    supported: ['aria-level', 'aria-posinset', 'aria-setsize'],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['li'],
  },
  {
    role: 'math',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['math'],
  },
  {
    role: 'meter',
    required: ['aria-valuenow'],
    supported: ['aria-valuemin', 'aria-valuemax', 'aria-valuetext'],
    prohibited: [],
    implicit_role_tags: ['meter'],
  },
  {
    role: 'none',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: [],
  },
  {
    role: 'note',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'paragraph',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['p'],
  },
  {
    role: 'presentation',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: [],
  },
  {
    role: 'row',
    required: [],
    supported: ['aria-rowindex', 'aria-level', 'aria-posinset', 'aria-setsize', 'aria-selected', 'aria-expanded'],
    prohibited: [],
    implicit_role_tags: ['tr'],
  },
  {
    role: 'rowgroup',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['tbody', 'thead', 'tfoot'],
  },
  {
    role: 'rowheader',
    required: [],
    supported: ['aria-sort', 'aria-readonly', 'aria-required', 'aria-selected', 'aria-rowindex', 'aria-colindex', 'aria-rowspan', 'aria-colspan', 'aria-expanded'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'strong',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['strong'],
  },
  {
    role: 'subscript',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['sub'],
  },
  {
    role: 'superscript',
    required: [],
    supported: [],
    prohibited: [...PROHIBITED_NAME_FROM_CONTENTS],
    implicit_role_tags: ['sup'],
  },
  {
    role: 'table',
    required: [],
    supported: ['aria-rowcount', 'aria-colcount'],
    prohibited: [],
    implicit_role_tags: ['table'],
  },
  {
    role: 'term',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['dfn', 'dt'],
  },
  {
    role: 'time',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['time'],
  },
  {
    role: 'toolbar',
    required: [],
    supported: ['aria-orientation', 'aria-activedescendant', 'aria-disabled'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'tooltip',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },

  // --- Landmark roles -------------------------------------------------------
  {
    role: 'banner',
    required: [],
    supported: [],
    prohibited: [],
    // <header> is banner only when scoped to the body context — conditional.
    implicit_role_tags: [],
  },
  {
    role: 'complementary',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['aside'],
  },
  {
    role: 'contentinfo',
    required: [],
    supported: [],
    prohibited: [],
    // <footer> is contentinfo only when scoped to body — conditional.
    implicit_role_tags: [],
  },
  {
    role: 'form',
    required: [],
    supported: [],
    prohibited: [],
    // <form> is the form landmark only when it has an accessible name —
    // conditional and intentionally omitted from implicit list.
    implicit_role_tags: [],
  },
  {
    role: 'main',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['main'],
  },
  {
    role: 'navigation',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: ['nav'],
  },
  {
    role: 'region',
    required: [],
    supported: [],
    prohibited: [],
    // <section> is region only with an accessible name — conditional.
    implicit_role_tags: [],
  },
  {
    role: 'search',
    required: [],
    supported: [],
    prohibited: [],
    implicit_role_tags: [],
  },

  // --- Live-region roles ----------------------------------------------------
  {
    role: 'alert',
    required: [],
    supported: ['aria-atomic', 'aria-live'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'log',
    required: [],
    supported: ['aria-atomic', 'aria-live'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'marquee',
    required: [],
    supported: ['aria-atomic', 'aria-live'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'status',
    required: [],
    supported: ['aria-atomic', 'aria-live'],
    prohibited: [],
    implicit_role_tags: ['output'],
  },
  {
    role: 'timer',
    required: [],
    supported: ['aria-atomic', 'aria-live'],
    prohibited: [],
    implicit_role_tags: [],
  },

  // --- Window roles ---------------------------------------------------------
  {
    role: 'alertdialog',
    required: [],
    supported: ['aria-modal'],
    prohibited: [],
    implicit_role_tags: [],
  },
  {
    role: 'dialog',
    required: [],
    supported: ['aria-modal'],
    prohibited: [],
    // <dialog> default role is `dialog`.
    implicit_role_tags: ['dialog'],
  },
];

/**
 * Map of role-name → spec for O(1) lookup. Built once at module load.
 */
export const ARIA_ROLE_INDEX: ReadonlyMap<string, AriaRoleSpec> = new Map(
  ARIA_ROLES.map((spec) => [spec.role, spec] as const),
);

/**
 * Closed-set value enums for ARIA properties whose value space is finite.
 * Properties not listed here accept any string (we do not validate URI lists,
 * idrefs, integers, etc. — that is out of scope for E4 and is handled by axe).
 */
export const ARIA_VALUE_ENUMS: Readonly<Record<string, readonly string[]>> = {
  'aria-checked': ['true', 'false', 'mixed', 'undefined'],
  'aria-pressed': ['true', 'false', 'mixed', 'undefined'],
  'aria-expanded': ['true', 'false', 'undefined'],
  'aria-selected': ['true', 'false', 'undefined'],
  'aria-disabled': ['true', 'false'],
  'aria-readonly': ['true', 'false'],
  'aria-required': ['true', 'false'],
  'aria-multiselectable': ['true', 'false'],
  'aria-multiline': ['true', 'false'],
  'aria-atomic': ['true', 'false'],
  'aria-busy': ['true', 'false'],
  'aria-modal': ['true', 'false'],
  'aria-hidden': ['true', 'false', 'undefined'],
  'aria-haspopup': ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
  'aria-orientation': ['horizontal', 'vertical', 'undefined'],
  'aria-autocomplete': ['none', 'inline', 'list', 'both'],
  'aria-current': ['true', 'false', 'page', 'step', 'location', 'date', 'time'],
  'aria-invalid': ['true', 'false', 'grammar', 'spelling'],
  'aria-live': ['off', 'polite', 'assertive'],
  'aria-relevant': ['additions', 'removals', 'text', 'all', 'additions text'],
  'aria-sort': ['ascending', 'descending', 'none', 'other'],
};
