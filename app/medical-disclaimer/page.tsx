import {PolicyPage} from '@/components/peptide/policy-page';

export const metadata={title:'Medical Disclaimer',description:'The educational scope and limitations of the peptide research information published by Peptides Anonymous.'};

export default function Page() {
  return <PolicyPage title="Medical Disclaimer" description="Research information to help you understand the evidence. Personal medical decisions belong with a qualified healthcare professional.">
    <section>
      <h2>Educational information</h2>
      <p>Peptides Anonymous provides general information about peptides, published studies, and the strength and limitations of the evidence. Its articles, tables, evidence grades, FAQs, and linked resources are for educational purposes. They do not provide personal medical advice, diagnosis, treatment, or prescribing services.</p>
      <p>Reading this site, creating an account, or saving research does not establish a clinician–patient relationship with the site, its operator, or its contributors.</p>
    </section>
    <section>
      <h2>Discuss decisions with your clinician</h2>
      <p>Ask a qualified healthcare professional who knows your medical history about symptoms, diagnoses, medicines, supplements, and treatment options. Do not start, stop, combine, or change a treatment based only on this website. Do not disregard professional advice or delay seeking care because of something you read here.</p>
      <p>Descriptions of doses, routes, or protocols used in a study explain the research; they are not instructions for personal use.</p>
    </section>
    <aside className="policy-callout" aria-label="Medical emergencies">
      <h2>For an emergency, seek immediate care</h2>
      <p>If you think you may be experiencing a medical emergency, contact your local emergency services or go to the nearest emergency department. This site does not provide emergency care or monitor requests for medical help.</p>
    </aside>
    <section>
      <h2>What the evidence can tell you</h2>
      <p>A study finding applies to the population, formulation, route, and outcome studied. Animal or laboratory findings do not establish a benefit in people. Early, small, or uncontrolled studies may not predict results in routine care. A reported benefit does not guarantee that an intervention will work for you.</p>
      <p>Low, Moderate, and High grades summarize confidence in a specific finding. They are not ratings of overall safety, product quality, regulatory approval, or suitability for an individual. A lack of reported adverse effects does not establish safety.</p>
      <p>Our summaries do not cover every study, interaction, adverse effect, precaution, or contraindication. Research and regulatory information can change, and a page may not reflect the latest findings. Read the original sources and our <a href="/methodology">editorial standards and evidence guide</a> for context.</p>
    </section>
    <section>
      <h2>No product or treatment endorsement</h2>
      <p>Including a peptide, product, study, or outside link is not a recommendation to buy, obtain, or use it. Inclusion does not mean that a substance is approved or lawful for a particular use where you live. Findings about one formulation or route should not be assumed to apply to another.</p>
      <p>Peptides Anonymous does not sell peptides, prescribe treatments, or verify the identity, purity, sterility, or safety of products offered by other parties. External websites are responsible for their own content and services.</p>
    </section>
    <section>
      <h2>Protect your personal health information</h2>
      <p>Your profile and saved library are research tools, not a medical record. Please do not enter diagnoses, treatment histories, or other sensitive health information in a profile, search, or routine message.</p>
    </section>
  </PolicyPage>;
}
