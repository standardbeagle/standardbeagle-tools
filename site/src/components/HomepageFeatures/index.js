import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Browser Debugging',
    description: (
      <>
        Debug web applications directly from Claude Code with reverse proxy,
        live screenshots, and sketch mode. Run accessibility and performance audits.
      </>
    ),
  },
  {
    title: 'Code Intelligence',
    description: (
      <>
        Sub-millisecond semantic code search with 79.8% context reduction.
        Navigate codebases and understand dependencies instantly.
      </>
    ),
  },
  {
    title: 'Workflow Automation',
    description: (
      <>
        Adversarial quality loops ensure every task goes through verification,
        security audit, and documentation review automatically.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
