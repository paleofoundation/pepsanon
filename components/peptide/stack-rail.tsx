'use client';

import {useState} from 'react';
import {ArrowLeft, ArrowRight} from 'lucide-react';

type RailLink = {href: string; label: string; detail?: string};

export function StackRail({ingredients, related, mode = 'stack'}: {ingredients: RailLink[]; related: RailLink[]; mode?: 'stack' | 'peptide'}) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside aria-label="Related stack research" className={`research-content__right related-research-panel${collapsed ? ' rail-collapsed' : ''}`}>
    <div className="research-content__left-menu">
      <button type="button" className="research-content__left-btn" aria-label={collapsed ? 'Expand related content' : 'Collapse related content'} aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>
        {collapsed ? <ArrowLeft/> : <ArrowRight/>}
      </button>
      <div className="related-panel-content">
        <nav className="related-research-links" aria-label={mode === 'peptide' ? 'Related peptides' : 'Ingredient guides'}>
          <h2>{mode === 'peptide' ? 'Related peptides' : 'Ingredient guides'}</h2>
          <ul>{ingredients.map(item => <li key={item.href}><a href={item.href}>{item.label}{item.detail && <small>{item.detail}</small>}</a></li>)}</ul>
        </nav>
        <nav className="related-research-links" aria-label="Related stacks">
          <h2>Related stacks</h2>
          <ul>{related.map(item => <li key={item.href}><a href={item.href}>{item.label}<small>{item.detail}</small></a></li>)}</ul>
          <a href="/stacks">Compare all stacks</a>
        </nav>
        <div className="research-content__right-actions">
          <a className="btn btn--full btn--outline" href="/methodology#grading">How we grade evidence</a>
          <div className="research-content__right-banner"><h3>{mode === 'peptide' ? 'Understand the evidence' : 'Assess the combination'}</h3><p>Check the intervention, route, outcome, and comparator behind each finding.</p><div className="research-content__right-banner-note"><a href="/methodology">Read our method</a></div></div>
        </div>
      </div>
    </div>
  </aside>;
}
