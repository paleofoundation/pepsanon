import type {ReactNode} from 'react';

export function PolicyPage({title,description,children}:{title:string;description:string;children:ReactNode}) {
  return <article className="policy-page">
    <header className="policy-page-header">
      <p className="section-kicker">PEPTIDES ANONYMOUS</p>
      <h1>{title}</h1>
      <p className="policy-page-lead">{description}</p>
      <p className="policy-page-date">Last updated <time dateTime="2026-10-04">4 October 2026</time></p>
    </header>
    <nav className="policy-page-nav" aria-label="Site policies">
      <a href="/methodology">Editorial standards</a>
      <a href="/medical-disclaimer" aria-current={title==='Medical Disclaimer'?'page':undefined}>Medical Disclaimer</a>
    </nav>
    <div className="policy-page-body">{children}</div>
  </article>;
}
