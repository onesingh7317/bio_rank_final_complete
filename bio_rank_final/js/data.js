/* ============================================================
   data.js — Mock data for Bio Rank NEET Biology Platform
   Replace API calls here when backend is ready.
   ============================================================ */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}
window.escapeHtml = escapeHtml;

const DB = {

  /* ---- Biology Chapters (Revised 32 Chapters in Exact Sequence) ---- */
  chapters: [
    { id: 'ch01', name: 'The Living World',                            icon: '🌍', questions: 35, class: '11', weightage: 5 },
    { id: 'ch02', name: 'Biological Classification',                   icon: '🦠', questions: 40, class: '11', weightage: 7 },
    { id: 'ch03', name: 'Plant Kingdom',                               icon: '🌿', questions: 42, class: '11', weightage: 7 },
    { id: 'ch04', name: 'Animal Kingdom',                              icon: '🦁', questions: 45, class: '11', weightage: 8 },
    { id: 'ch05', name: 'Morphology of Flowering Plants',              icon: '🌸', questions: 38, class: '11', weightage: 7 },
    { id: 'ch06', name: 'Anatomy of Flowering Plants',                 icon: '🪵', questions: 36, class: '11', weightage: 6 },
    { id: 'ch07', name: 'Structural Organisation in Animals',          icon: '🐸', questions: 32, class: '11', weightage: 6 },
    { id: 'ch08', name: 'Cell: The Unit of Life',                     icon: '🔬', questions: 45, class: '11', weightage: 8 },
    { id: 'ch09', name: 'Biomolecules',                                icon: '🧬', questions: 40, class: '11', weightage: 7 },
    { id: 'ch10', name: 'Cell Cycle and Cell Division',                icon: '⚙️', questions: 38, class: '11', weightage: 7 },
    { id: 'ch11', name: 'Photosynthesis in Plants',                    icon: '☀️', questions: 42, class: '11', weightage: 8 },
    { id: 'ch12', name: 'Respiration in Plants',                       icon: '💨', questions: 35, class: '11', weightage: 6 },
    { id: 'ch13', name: 'Plant Growth and Development',                icon: '🌱', questions: 32, class: '11', weightage: 5 },
    { id: 'ch14', name: 'Breathing and Exchange of Gases',             icon: '🫁', questions: 36, class: '11', weightage: 6 },
    { id: 'ch15', name: 'Body Fluids and Circulation',                 icon: '🩸', questions: 40, class: '11', weightage: 7 },
    { id: 'ch16', name: 'Excretory Products and Their Elimination',     icon: '🧪', questions: 35, class: '11', weightage: 6 },
    { id: 'ch17', name: 'Locomotion and Movement',                       icon: '🦴', questions: 34, class: '11', weightage: 6 },
    { id: 'ch18', name: 'Neural Control and Coordination',               icon: '🧠', questions: 42, class: '11', weightage: 8 },
    { id: 'ch19', name: 'Chemical Coordination and Integration',       icon: '⚗️', questions: 38, class: '11', weightage: 7 },
    { id: 'ch20', name: 'Sexual Reproduction in Flowering Plants',       icon: '🌺', questions: 42, class: '12', weightage: 8 },
    { id: 'ch21', name: 'Human Reproduction',                          icon: '👶', questions: 45, class: '12', weightage: 8 },
    { id: 'ch22', name: 'Reproductive Health',                         icon: '🏥', questions: 32, class: '12', weightage: 6 },
    { id: 'ch23', name: 'Principles of Inheritance and Variation',      icon: '🧩', questions: 48, class: '12', weightage: 9 },
    { id: 'ch24', name: 'Molecular Basis of Inheritance',              icon: '🔗', questions: 50, class: '12', weightage: 9 },
    { id: 'ch25', name: 'Evolution',                                   icon: '🦎', questions: 35, class: '12', weightage: 6 },
    { id: 'ch26', name: 'Human Health and Disease',                      icon: '💊', questions: 42, class: '12', weightage: 8 },
    { id: 'ch27', name: 'Microbes in Human Welfare',                   icon: '🦠', questions: 30, class: '12', weightage: 5 },
    { id: 'ch28', name: 'Biotechnology: Principles and Processes',     icon: '💡', questions: 40, class: '12', weightage: 8 },
    { id: 'ch29', name: 'Biotechnology and its Applications',          icon: '🔬', questions: 38, class: '12', weightage: 7 },
    { id: 'ch30', name: 'Organisms and Population',                    icon: '🌏', questions: 35, class: '12', weightage: 6 },
    { id: 'ch31', name: 'Ecosystem',                                   icon: '🌳', questions: 36, class: '12', weightage: 6 },
    { id: 'ch32', name: 'Biodiversity and Conservation',               icon: '🐾', questions: 34, class: '12', weightage: 6 },
  ],

  /* ---- Full Length Tests (complete NEET Biology mock tests).
     Centralized mock/static list — the Full Length Test page maps over
     this array, so adding more entries here (e.g. once an admin upload
     system exists) automatically makes them appear on the page. ---- */
  fullLengthTests: [
    { id: 'flt01', title: 'Full Length Test 1', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt02', title: 'Full Length Test 2', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt03', title: 'Full Length Test 3', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt04', title: 'Full Length Test 4', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt05', title: 'Full Length Test 5', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
  ],

  /* ---- PYQ Years (legacy year-wise data — kept for reference/rollback.
     The PYQ Test page now uses chapter-wise navigation (see `chapters`
     above); this array is no longer read by renderPYQTest but is left
     intact since removing it wasn't required and other work may still
     reference it.) ---- */
  pyqYears: [
    { id: 'pyq2024', year: 2024, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2023', year: 2023, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2022', year: 2022, shifts: ['Shift 1', 'Shift 2', 'Shift 3'], questions: 90 },
    { id: 'pyq2021', year: 2021, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2020', year: 2020, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2019', year: 2019, shifts: ['Shift 1'], questions: 90 },
  ],

  /* ---- CUET PYQ Years (Official NTA CUET UG Biology Papers) ---- */
  cuetPyqYears: [
    { id: 'cuet2024', year: 2024, shifts: ['May 15 Slot 1', 'May 17 Slot 2', 'May 21 Slot 1'], questions: 50, exam: 'CUET UG 2024' },
    { id: 'cuet2023', year: 2023, shifts: ['May 21 Slot 1', 'May 24 Slot 2', 'June 01 Slot 1'], questions: 50, exam: 'CUET UG 2023' },
    { id: 'cuet2022', year: 2022, shifts: ['July 15 Slot 1', 'August 04 Slot 2'], questions: 50, exam: 'CUET UG 2022' },
  ],

  /* ---- Sub-skills ---- */
  subSkills: [
    { id: 'ss01', name: 'Cell organelle functions',       chapter: 'ch08', bloomLevel: 'understand' },
    { id: 'ss02', name: 'Mitosis stages & significance',  chapter: 'ch10', bloomLevel: 'understand' },
    { id: 'ss03', name: 'Meiosis & genetic variation',    chapter: 'ch10', bloomLevel: 'analyze'    },
    { id: 'ss04', name: 'Enzyme kinetics',                chapter: 'ch09', bloomLevel: 'apply'      },
    { id: 'ss05', name: 'Light reaction steps (Z-scheme)',chapter: 'ch11', bloomLevel: 'analyze'    },
    { id: 'ss06', name: 'Calvin cycle intermediates',     chapter: 'ch11', bloomLevel: 'remember'   },
    { id: 'ss07', name: 'Krebs cycle yield calculation',  chapter: 'ch12', bloomLevel: 'apply'      },
    { id: 'ss08', name: 'Neurotransmitter mechanisms',    chapter: 'ch18', bloomLevel: 'understand' },
    { id: 'ss09', name: 'Hormonal feedback loops',        chapter: 'ch19', bloomLevel: 'analyze'    },
    { id: 'ss10', name: 'Mendelian genetics problems',    chapter: 'ch23', bloomLevel: 'apply'      },
    { id: 'ss11', name: 'DNA replication enzymes',        chapter: 'ch24', bloomLevel: 'remember'   },
    { id: 'ss12', name: 'Transcription & translation',    chapter: 'ch24', bloomLevel: 'understand' },
    { id: 'ss13', name: 'Pedigree analysis',              chapter: 'ch23', bloomLevel: 'analyze'    },
    { id: 'ss14', name: 'Blood clotting cascade',         chapter: 'ch15', bloomLevel: 'remember'   },
    { id: 'ss15', name: 'Nephron filtration dynamics',    chapter: 'ch16', bloomLevel: 'understand' },
    { id: 'ss16', name: 'Immunity & Disease mechanisms',   chapter: 'ch26', bloomLevel: 'remember'   },
    { id: 'ss17', name: 'Embryonic development & stages',  chapter: 'ch21', bloomLevel: 'understand' },
    { id: 'ss18', name: 'Ecological efficiency & pyramids', chapter: 'ch31', bloomLevel: 'understand' },
    { id: 'ss19', name: 'Restriction enzymes & cloning',  chapter: 'ch28', bloomLevel: 'remember'   },
    { id: 'ss20', name: 'Pollen tube & fertilization',     chapter: 'ch20', bloomLevel: 'understand' },
    { id: 'ss21', name: 'Hardy-Weinberg equilibrium',      chapter: 'ch25', bloomLevel: 'understand' },
    { id: 'ss22', name: 'Plant hormones & dominance',      chapter: 'ch13', bloomLevel: 'understand' },
    { id: 'ss23', name: 'Biocontrol & microbes in sewage', chapter: 'ch27', bloomLevel: 'remember'   },
    { id: 'ss24', name: 'Respiratory volumes & capacities', chapter: 'ch14', bloomLevel: 'remember'   },
  ],

  /* ---- Biology Questions Bank ---- */
  questions: [
    {
      id: 'q001', chapter: 'ch24', subSkill: 'ss11', bloomLevel: 'remember', weightage: 9, year: 2023,
      text: 'Which enzyme catalyzes the unwinding of DNA double helix during replication?',
      options: ['DNA Polymerase I', 'Helicase', 'Ligase', 'Primase'],
      correct: 1,
      explanation: 'Helicase breaks the hydrogen bonds between complementary base pairs and unwinds the DNA double helix at the replication fork.'
    },
    {
      id: 'q002', chapter: 'ch11', subSkill: 'ss05', bloomLevel: 'analyze', weightage: 8, year: 2022,
      text: 'In the Z-scheme of photosynthesis, which molecule serves as the primary electron donor to Photosystem II?',
      options: ['NADPH', 'Ferredoxin', 'Water (H₂O)', 'Plastoquinone'],
      correct: 2,
      explanation: 'Water is the primary electron donor to PS II. Its oxidation (photolysis) releases O₂, H⁺, and electrons.'
    },
    {
      id: 'q003', chapter: 'ch23', subSkill: 'ss10', bloomLevel: 'apply', weightage: 9, year: 2024,
      text: 'In a dihybrid cross between AaBb × aabb (Mendel\'s second law applies), what fraction of offspring will show both dominant traits?',
      options: ['1/16', '9/16', '1/4', '3/16'],
      correct: 2,
      explanation: 'AaBb × aabb gives 1 AaBb : 1 Aabb : 1 aaBb : 1 aabb. AaBb shows both dominant traits = 1/4.'
    },
    {
      id: 'q004', chapter: 'ch18', subSkill: 'ss08', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'Which neurotransmitter is primarily released at the neuromuscular junction to initiate skeletal muscle contraction?',
      options: ['Dopamine', 'Serotonin', 'Acetylcholine', 'Norepinephrine'],
      correct: 2,
      explanation: 'Acetylcholine (ACh) is released by motor neurons at the neuromuscular junction, binding to nicotinic receptors on the motor end plate.'
    },
    {
      id: 'q005', chapter: 'ch10', subSkill: 'ss02', bloomLevel: 'understand', weightage: 7, year: 2022,
      text: 'During which phase of mitosis do centromeres split and chromatids move to opposite poles?',
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      correct: 2,
      explanation: 'During Anaphase, centromeres split and sister chromatids are pulled to opposite poles by spindle fibers.'
    },
    {
      id: 'q006', chapter: 'ch12', subSkill: 'ss07', bloomLevel: 'apply', weightage: 6, year: 2021,
      text: 'How many ATP molecules are produced during one complete turn of the Krebs cycle (per acetyl-CoA)?',
      options: ['2', '12', '8', '10'],
      correct: 3,
      explanation: 'One turn of Krebs cycle produces: 3 NADH (×2.5 ATP = 7.5), 1 FADH₂ (×1.5 ATP = 1.5), 1 GTP = 1 ATP. Total ≈ 10 ATP.'
    },
    {
      id: 'q007', chapter: 'ch16', subSkill: 'ss15', bloomLevel: 'understand', weightage: 6, year: 2023,
      text: 'The juxtaglomerular apparatus (JGA) secretes renin in response to:',
      options: ['High blood pressure', 'High sodium in filtrate', 'Low blood pressure / low filtrate flow', 'High ADH levels'],
      correct: 2,
      explanation: 'JGA cells detect low blood pressure and low GFR, triggering renin secretion which initiates the RAAS to increase blood pressure.'
    },
    {
      id: 'q008', chapter: 'ch15', subSkill: 'ss14', bloomLevel: 'remember', weightage: 7, year: 2022,
      text: 'Which clotting factor is absent in haemophilia A?',
      options: ['Factor IX', 'Factor VIII', 'Factor XI', 'von Willebrand factor'],
      correct: 1,
      explanation: 'Haemophilia A is caused by deficiency of Factor VIII (anti-haemophilic factor), an essential clotting factor.'
    },
    {
      id: 'q009', chapter: 'ch24', subSkill: 'ss12', bloomLevel: 'understand', weightage: 9, year: 2024,
      text: 'Which RNA polymerase transcribes structural genes (mRNA) in eukaryotes?',
      options: ['RNA Polymerase I', 'RNA Polymerase II', 'RNA Polymerase III', 'Primase'],
      correct: 1,
      explanation: 'RNA Polymerase II transcribes mRNA (protein-coding genes) in eukaryotes. Pol I makes rRNA; Pol III makes tRNA and 5S rRNA.'
    },
    {
      id: 'q010', chapter: 'ch19', subSkill: 'ss09', bloomLevel: 'analyze', weightage: 7, year: 2023,
      text: 'In a negative feedback loop, rising blood glucose causes the pancreas to secrete insulin. Which of the following correctly describes the role of insulin?',
      options: [
        'Stimulates glucagon release to increase glycogenesis',
        'Promotes glucose uptake by cells and glycogen synthesis, lowering blood glucose',
        'Inhibits glucose uptake and promotes glycogenolysis',
        'Stimulates cortisol to raise blood glucose'
      ],
      correct: 1,
      explanation: 'Insulin promotes glucose uptake by peripheral cells (via GLUT4), glycogenesis, and inhibits gluconeogenesis — all of which lower blood glucose.'
    },
    {
      id: 'q011', chapter: 'ch08', subSkill: 'ss01', bloomLevel: 'understand', weightage: 8, year: 2022,
      text: 'Which organelle is responsible for the synthesis of proteins destined for secretion?',
      options: ['Free ribosomes', 'Rough endoplasmic reticulum', 'Smooth endoplasmic reticulum', 'Peroxisomes'],
      correct: 1,
      explanation: 'Rough ER (studded with ribosomes) synthesizes secretory proteins. These are then transported to the Golgi apparatus for modification and packaging.'
    },
    {
      id: 'q012', chapter: 'ch11', subSkill: 'ss06', bloomLevel: 'remember', weightage: 8, year: 2021,
      text: 'Which 3-carbon compound is the first stable product of the Calvin cycle (C3 photosynthesis)?',
      options: ['Oxaloacetate (OAA)', '3-Phosphoglycerate (3-PGA)', 'Ribulose-1,5-bisphosphate (RuBP)', 'Glyceraldehyde-3-phosphate (G3P)'],
      correct: 1,
      explanation: 'CO₂ is fixed by RuBisCO onto RuBP to form an unstable 6C compound which immediately splits into two molecules of 3-PGA (3-phosphoglycerate).'
    },
    {
      id: 'q013', chapter: 'ch23', subSkill: 'ss13', bloomLevel: 'analyze', weightage: 9, year: 2024,
      text: 'A pedigree shows a trait appearing in every generation with both males and females affected and unaffected parents having affected children. The most likely inheritance pattern is:',
      options: ['Autosomal recessive', 'X-linked recessive', 'Autosomal dominant', 'Mitochondrial inheritance'],
      correct: 2,
      explanation: 'Autosomal dominant traits appear in every generation, affect both sexes equally, and an affected individual has at least one affected parent.'
    },
    {
      id: 'q014', chapter: 'ch10', subSkill: 'ss03', bloomLevel: 'analyze', weightage: 7, year: 2022,
      text: 'Crossing over during meiosis occurs between non-sister chromatids of homologous chromosomes during:',
      options: ['Leptotene', 'Zygotene', 'Pachytene', 'Diplotene'],
      correct: 2,
      explanation: 'Crossing over (chiasmata formation) occurs during Pachytene of meiosis I prophase, when tetrads are fully formed and chromatids can exchange segments.'
    },
    {
      id: 'q015', chapter: 'ch09', subSkill: 'ss04', bloomLevel: 'apply', weightage: 7, year: 2023,
      text: 'At very high substrate concentrations, which factor most significantly limits enzyme-catalyzed reaction rate?',
      options: ['Substrate concentration', 'Product inhibition', 'Available enzyme (active sites)', 'Temperature below optimum'],
      correct: 2,
      explanation: 'At saturating substrate concentrations, all active sites are occupied — the reaction rate is at Vmax and is limited only by enzyme concentration.'
    },
    {
      id: 'q016', chapter: 'ch26', subSkill: 'ss16', bloomLevel: 'remember', weightage: 7, year: 2022,
      text: 'Which of the following is NOT an antigen presenting cell (APC) in the immune system?',
      options: ['Dendritic cell', 'Macrophage', 'B lymphocyte', 'Cytotoxic T cell'],
      correct: 3,
      explanation: 'Cytotoxic T cells (CD8⁺) kill infected cells; they are effector cells, not antigen presenting cells. APCs include dendritic cells, macrophages, and B cells.'
    },
    {
      id: 'q017', chapter: 'ch21', subSkill: 'ss17', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'During which week of human embryonic development does implantation typically occur?',
      options: ['Week 1', 'End of week 1 / beginning of week 2', 'Week 3', 'Week 4'],
      correct: 1,
      explanation: 'The blastocyst implants in the uterine endometrium around day 6–10 (end of first week / start of second week) after fertilization.'
    },
    {
      id: 'q018', chapter: 'ch31', subSkill: 'ss18', bloomLevel: 'understand', weightage: 6, year: 2021,
      text: 'In a food chain, ecological efficiency is the percentage of energy transferred from one trophic level to the next. The typical value is:',
      options: ['1–2%', '10%', '50%', '90%'],
      correct: 1,
      explanation: 'Ecological or Lindeman\'s efficiency is approximately 10% — meaning only 10% of energy at one trophic level is available to the next.'
    },
    {
      id: 'q019', chapter: 'ch28', subSkill: 'ss19', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'The enzyme used to cut DNA at specific sequences in recombinant DNA technology is called:',
      options: ['DNA ligase', 'Restriction endonuclease', 'Reverse transcriptase', 'Taq polymerase'],
      correct: 1,
      explanation: 'Restriction endonucleases (restriction enzymes) recognize specific palindromic sequences and cleave DNA. They are the "molecular scissors" of rDNA technology.'
    },
    {
      id: 'q020', chapter: 'ch24', subSkill: 'ss11', bloomLevel: 'understand', weightage: 9, year: 2023,
      text: 'Okazaki fragments are synthesized in which direction on the lagging strand during DNA replication?',
      options: ["3' to 5'", "5' to 3'", "Both directions", "Neither — they are joined without synthesis"],
      correct: 1,
      explanation: "DNA polymerase can only synthesize in the 5'→3' direction. On the lagging strand, short Okazaki fragments are synthesized 5'→3' in the direction away from the replication fork."
    },
    {
      id: 'q021', chapter: 'ch18', subSkill: 'ss08', bloomLevel: 'apply', weightage: 8, year: 2022,
      text: 'An action potential is triggered when the membrane potential reaches:',
      options: ['Resting potential (–70 mV)', 'Threshold potential (~–55 mV)', '+30 mV', '0 mV'],
      correct: 1,
      explanation: 'Once the membrane is depolarized to the threshold potential (~–55 mV), voltage-gated Na⁺ channels open rapidly and an action potential is generated.'
    },
    {
      id: 'q022', chapter: 'ch19', subSkill: 'ss09', bloomLevel: 'remember', weightage: 7, year: 2021,
      text: 'Which gland secretes melatonin, and what is its primary function?',
      options: [
        'Adrenal cortex — regulates stress',
        'Pineal gland — regulates circadian rhythms',
        'Thyroid gland — regulates metabolism',
        'Pituitary gland — regulates growth'
      ],
      correct: 1,
      explanation: 'The pineal gland secretes melatonin in response to darkness, which regulates circadian rhythms and seasonal reproductive cycles.'
    },
    {
      id: 'q023', chapter: 'ch15', subSkill: 'ss14', bloomLevel: 'understand', weightage: 7, year: 2023,
      text: 'Which of the following correctly describes the ABO blood group system?',
      options: [
        'Blood group A has B antigens on RBCs and anti-A antibodies in plasma',
        'Blood group O has no antigens on RBCs and both anti-A and anti-B antibodies in plasma',
        'Blood group AB has no antibodies on RBCs',
        'Blood group B has A antigens and anti-B antibodies'
      ],
      correct: 1,
      explanation: 'Blood group O: no A or B antigens on RBCs, but both anti-A and anti-B antibodies in plasma — making O donors universal but O recipients restricted.'
    },
    {
      id: 'q024', chapter: 'ch12', subSkill: 'ss07', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'The final electron acceptor in aerobic cellular respiration in the electron transport chain is:',
      options: ['NAD⁺', 'FAD', 'Oxygen (O₂)', 'Carbon dioxide (CO₂)'],
      correct: 2,
      explanation: 'O₂ is the terminal electron acceptor in aerobic respiration, accepting electrons at Complex IV (cytochrome c oxidase) to form water.'
    },
    {
      id: 'q025', chapter: 'ch08', subSkill: 'ss01', bloomLevel: 'analyze', weightage: 8, year: 2024,
      text: 'Which cell component is absent in plant cells but present in animal cells?',
      options: ['Cell wall', 'Mitochondria', 'Centrioles', 'Chloroplasts'],
      correct: 2,
      explanation: 'Centrioles are present in animal cells (and lower plant cells) but absent in most higher plant cells. They are involved in forming the spindle apparatus during cell division.'
    },
    {
      id: 'q026', chapter: 'ch20', subSkill: 'ss20', bloomLevel: 'understand', weightage: 7, year: 2022,
      text: 'The pollen tube grows through which part of the pistil to deliver the male gametes?',
      options: ['Stigma', 'Style', 'Ovary wall', 'Funicle'],
      correct: 1,
      explanation: 'After landing on the stigma, pollen germinates and the pollen tube grows through the style (transmitting tissue) to reach the ovule.'
    },
    {
      id: 'q027', chapter: 'ch25', subSkill: 'ss21', bloomLevel: 'understand', weightage: 5, year: 2021,
      text: 'According to the Hardy-Weinberg principle, allele frequencies in a population remain constant if:',
      options: [
        'Natural selection is acting strongly on the population',
        'Random mating, no mutation, no migration, no genetic drift, no selection',
        'Population size is very small',
        'Gene flow occurs between populations'
      ],
      correct: 1,
      explanation: 'Hardy-Weinberg equilibrium requires: random mating, large population (no genetic drift), no mutations, no gene flow, and no natural selection.'
    },
    {
      id: 'q028', chapter: 'ch13', subSkill: 'ss22', bloomLevel: 'understand', weightage: 5, year: 2022,
      text: 'Which plant hormone is primarily responsible for apical dominance?',
      options: ['Gibberellin', 'Cytokinin', 'Auxin (IAA)', 'Abscisic acid'],
      correct: 2,
      explanation: 'Auxin produced at the apical bud suppresses lateral bud growth (apical dominance). Removal of the apical bud allows lateral buds to grow.'
    },
    {
      id: 'q029', chapter: 'ch27', subSkill: 'ss23', bloomLevel: 'remember', weightage: 5, year: 2023,
      text: 'Which of the following biocontrol agents is a fungus used against several plant pathogens?',
      options: ['Trichoderma', 'Bacillus thuringiensis', 'Baculoviruses', 'Ladybird'],
      correct: 0,
      explanation: 'Trichoderma species are free-living fungi that are very common in root ecosystems and effective biocontrol agents against several plant pathogens.'
    },
    {
      id: 'q030', chapter: 'ch14', subSkill: 'ss24', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'Normal tidal volume in an adult human at rest is approximately:',
      options: ['1200 mL', '2300 mL', '500 mL', '3500 mL'],
      correct: 2,
      explanation: 'Tidal volume (TV) is the volume of air inhaled or exhaled in a normal breath at rest, approximately 500 mL.'
    },
    {
      id: 'q031', chapter: 'ch01', subSkill: 'ss01', bloomLevel: 'understand', weightage: 8, year: 2024,
      text: 'Which of the following cellular structures is not surrounded by any membrane?',
      options: ['Lysosome', 'Ribosome', 'Peroxisome', 'Vacuole'],
      correct: 1,
      explanation: 'Ribosomes and centrosomes are non-membrane bound organelles found in cells.'
    },
    {
      id: 'q032', chapter: 'ch02', subSkill: 'ss02', bloomLevel: 'remember', weightage: 7, year: 2023,
      text: 'Synaptonemal complex dissolves during which sub-stage of Prophase I?',
      options: ['Zygotene', 'Pachytene', 'Diplotene', 'Diakinesis'],
      correct: 2,
      explanation: 'Dissolution of the synaptonemal complex occurs in Diplotene, making chiasmata visible.'
    },
    {
      id: 'q033', chapter: 'ch03', subSkill: 'ss04', bloomLevel: 'understand', weightage: 7, year: 2024,
      text: 'Which of the following is a competitive inhibitor of the enzyme succinate dehydrogenase?',
      options: ['Malonate', 'Oxaloacetate', 'Citrate', 'Fumarate'],
      correct: 0,
      explanation: 'Malonate closely resembles succinate in structure and competitively inhibits succinate dehydrogenase.'
    },
    {
      id: 'q034', chapter: 'ch03', subSkill: 'ss04', bloomLevel: 'remember', weightage: 7, year: 2022,
      text: 'A nucleotide consists of which of the following components?',
      options: [
        'Nitrogenous base + Phosphate group only',
        'Nitrogenous base + Pentose sugar + Phosphate group',
        'Pentose sugar + Phosphate group only',
        'Nitrogenous base + Hexose sugar + Sulfate group'
      ],
      correct: 1,
      explanation: 'A nucleotide is formed of a nitrogenous base attached to a pentose sugar and a phosphate group esterified to the sugar.'
    },
    {
      id: 'q035', chapter: 'ch04', subSkill: 'ss05', bloomLevel: 'analyze', weightage: 8, year: 2023,
      text: 'Kranz anatomy is a characteristic feature of leaves of which type of plants?',
      options: ['C3 plants', 'C4 plants', 'CAM plants', 'Hydrophytes'],
      correct: 1,
      explanation: 'Kranz anatomy with prominent bundle sheath cells containing large chloroplasts is characteristic of C4 plants like maize and sugarcane.'
    },
    {
      id: 'q036', chapter: 'ch05', subSkill: 'ss07', bloomLevel: 'remember', weightage: 6, year: 2024,
      text: 'What is the net gain of ATP molecules synthesized during glycolysis of one glucose molecule?',
      options: ['2 ATP', '4 ATP', '36 ATP', '38 ATP'],
      correct: 0,
      explanation: 'Glycolysis uses 2 ATP molecules and generates 4 ATP molecules by substrate level phosphorylation, netting 2 ATP.'
    },
    {
      id: 'q037', chapter: 'ch06', subSkill: 'ss22', bloomLevel: 'understand', weightage: 5, year: 2023,
      text: 'Which phytohormone is commonly known as the stress hormone in plants?',
      options: ['Auxin', 'Gibberellic acid', 'Abscisic acid (ABA)', 'Cytokinin'],
      correct: 2,
      explanation: 'Abscisic acid (ABA) stimulates stomatal closure during water stress and promotes seed dormancy.'
    },
    {
      id: 'q038', chapter: 'ch06', subSkill: 'ss22', bloomLevel: 'remember', weightage: 5, year: 2022,
      text: 'Which gaseous plant growth regulator promotes fruit ripening and enhances respiration rate (respiratory climacteric)?',
      options: ['Ethylene', 'IAA', 'GA3', 'Zeatin'],
      correct: 0,
      explanation: 'Ethylene is a gaseous hormone that triggers fruit ripening and climacteric respiration.'
    },
    {
      id: 'q039', chapter: 'ch07', subSkill: 'ss25', bloomLevel: 'remember', weightage: 7, year: 2023,
      text: 'Which cells in the gastric glands of stomach mucosa secrete intrinsic factor for absorption of vitamin B12?',
      options: ['Peptic / Chief cells', 'Parietal / Oxyntic cells', 'Goblet cells', 'Enteroendocrine cells'],
      correct: 1,
      explanation: 'Parietal (oxyntic) cells secrete HCl and Castle’s intrinsic factor, which is essential for vitamin B12 absorption in the ileum.'
    },
    {
      id: 'q040', chapter: 'ch07', subSkill: 'ss25', bloomLevel: 'understand', weightage: 7, year: 2022,
      text: 'Enterokinase enzyme is secreted by intestinal mucosa to activate which proenzyme?',
      options: ['Pepsinogen into pepsin', 'Trypsinogen into trypsin', 'Procarboxypeptidase into carboxypeptidase', 'Chymotrypsinogen into chymotrypsin'],
      correct: 1,
      explanation: 'Enterokinase converts pancreatic trypsinogen into active trypsin, which then activates other pancreatic enzymes.'
    },
    {
      id: 'q041', chapter: 'ch07', subSkill: 'ss25', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'Brunner’s glands are characteristically located in which layer of the duodenum?',
      options: ['Mucosa', 'Submucosa', 'Muscularis', 'Serosa'],
      correct: 1,
      explanation: 'Brunner’s glands are located in the submucosa of the duodenum and secrete an alkaline mucus.'
    },
    {
      id: 'q042', chapter: 'ch08', subSkill: 'ss24', bloomLevel: 'understand', weightage: 6, year: 2023,
      text: 'The majority of carbon dioxide (about 70%) is transported in human blood as:',
      options: ['Dissolved CO2 in plasma', 'Carbamino-hemoglobin', 'Bicarbonate ions (HCO3⁻)', 'Carbonic acid'],
      correct: 2,
      explanation: 'Around 70% of CO2 is transported as bicarbonate ions in plasma, catalyzed by carbonic anhydrase in RBCs.'
    },
    {
      id: 'q043', chapter: 'ch08', subSkill: 'ss24', bloomLevel: 'remember', weightage: 6, year: 2024,
      text: 'Pneumotaxic center which can moderate the functions of the respiratory rhythm center is located in:',
      options: ['Medulla oblongata', 'Pons varolii of brain', 'Cerebellum', 'Thalamus'],
      correct: 1,
      explanation: 'Pneumotaxic center is located in the pons region of the brainstem and limits inspiratory duration.'
    },
    {
      id: 'q044', chapter: 'ch09', subSkill: 'ss14', bloomLevel: 'understand', weightage: 7, year: 2023,
      text: 'In the cardiac cycle, the "lub" first heart sound is caused by the closure of:',
      options: ['Semilunar valves', 'Bicuspid and tricuspid (AV) valves', 'Aortic valve only', 'Eustachian valve'],
      correct: 1,
      explanation: 'The first heart sound (lub) is produced by the closure of atrioventricular (tricuspid and bicuspid) valves during ventricular systole.'
    },
    {
      id: 'q045', chapter: 'ch09', subSkill: 'ss14', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'The pacemaker of the human heart that generates action potentials at the highest rate is:',
      options: ['AV node', 'SA node', 'Bundle of His', 'Purkinje fibers'],
      correct: 1,
      explanation: 'The Sino-Atrial Node (SAN) in the right atrium initiates 70–75 action potentials per minute, acting as the primary pacemaker.'
    },
    {
      id: 'q046', chapter: 'ch10', subSkill: 'ss15', bloomLevel: 'understand', weightage: 6, year: 2022,
      text: 'Podocytes are specialized epithelial cells present in which part of the nephron?',
      options: ['Visceral layer of Bowman’s capsule', 'Proximal convoluted tubule', 'Ascending loop of Henle', 'Collecting duct'],
      correct: 0,
      explanation: 'Podocytes line the inner visceral wall of Bowman’s capsule and form filtration slits for ultrafiltration.'
    },
    {
      id: 'q047', chapter: 'ch10', subSkill: 'ss15', bloomLevel: 'remember', weightage: 6, year: 2024,
      text: 'Which hormone causes reabsorption of Na⁺ and water from the distal parts of the renal tubule?',
      options: ['Aldosterone', 'ANF (Atrial Natriuretic Factor)', 'Thyroxine', 'Oxytocin'],
      correct: 0,
      explanation: 'Aldosterone released from the adrenal cortex acts on distal tubules to stimulate active Na⁺ and water reabsorption.'
    },
    {
      id: 'q048', chapter: 'ch11', subSkill: 'ss26', bloomLevel: 'understand', weightage: 5, year: 2023,
      text: 'According to the sliding filament theory of muscle contraction, which zone shortens and disappears during contraction?',
      options: ['A band', 'H zone and I band', 'Z line only', 'M line only'],
      correct: 1,
      explanation: 'During contraction, actin filaments slide over myosin, causing the I-band and central H-zone to shorten/disappear while A-band length remains constant.'
    },
    {
      id: 'q049', chapter: 'ch11', subSkill: 'ss26', bloomLevel: 'remember', weightage: 5, year: 2022,
      text: 'Which protein masks the active binding sites for myosin on the actin filaments in a resting muscle fiber?',
      options: ['Troponin', 'Tropomyosin', 'Meromyosin', 'Myoglobin'],
      correct: 1,
      explanation: 'Tropomyosin runs along the grooves of actin and covers the myosin binding sites, held in place by troponin.'
    },
    {
      id: 'q050', chapter: 'ch11', subSkill: 'ss26', bloomLevel: 'remember', weightage: 5, year: 2024,
      text: 'The pivot joint between the atlas and axis vertebrae is a type of:',
      options: ['Fibrous joint', 'Cartilaginous joint', 'Synovial joint', 'Suture'],
      correct: 2,
      explanation: 'The joint between atlas and axis is a synovial pivot joint allowing rotational head movement.'
    },
    {
      id: 'q051', chapter: 'ch12', subSkill: 'ss08', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'Corpus callosum is a tract of nerve fibers connecting the:',
      options: ['Left and right cerebral hemispheres', 'Cerebrum with cerebellum', 'Pons with medulla', 'Two lobes of thalamus'],
      correct: 0,
      explanation: 'The corpus callosum is a large C-shaped nerve fiber bundle connecting the left and right cerebral hemispheres.'
    },
    {
      id: 'q052', chapter: 'ch12', subSkill: 'ss08', bloomLevel: 'remember', weightage: 8, year: 2024,
      text: 'The sensory receptor organ of hearing in the human ear containing hair cells on the basilar membrane is:',
      options: ['Organ of Corti', 'Macula lutea', 'Crista ampullaris', 'Tympanic membrane'],
      correct: 0,
      explanation: 'The Organ of Corti rests on the basilar membrane of the cochlea and converts sound wave vibrations into nerve impulses.'
    },
    {
      id: 'q053', chapter: 'ch13', subSkill: 'ss09', bloomLevel: 'understand', weightage: 7, year: 2023,
      text: 'Which hormone is secreted by the intermediate lobe (pars intermedia) of the pituitary gland?',
      options: ['Melanocyte Stimulating Hormone (MSH)', 'Oxytocin', 'Vasopressin', 'Prolactin'],
      correct: 0,
      explanation: 'Pars intermedia secretes MSH, which regulates skin pigmentation.'
    },
    {
      id: 'q054', chapter: 'ch13', subSkill: 'ss09', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'Tetany caused by rapid muscle spasms and hypocalcemia is linked to hyposecretion of:',
      options: ['Parathyroid hormone (PTH)', 'Thyrocalcitonin', 'Glucagon', 'Epinephrine'],
      correct: 0,
      explanation: 'Deficiency of PTH lowers blood Ca²⁺ levels (hypocalcemia), leading to increased neuromuscular excitability and tetany.'
    },
    {
      id: 'q055', chapter: 'ch14', subSkill: 'ss27', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'Which of the following organisms reproduces asexually by internal buds called gemmules?',
      options: ['Spongilla (freshwater sponge)', 'Hydra', 'Planaria', 'Yeast'],
      correct: 0,
      explanation: 'Spongilla forms internal asexual reproductive buds called gemmules.'
    },
    {
      id: 'q056', chapter: 'ch14', subSkill: 'ss27', bloomLevel: 'understand', weightage: 6, year: 2023,
      text: 'Vegetative propagation in water hyacinth (Eichhornia) occurs rapidly through:',
      options: ['Offsets', 'Rhizomes', 'Bulbils', 'Runners'],
      correct: 0,
      explanation: 'Water hyacinth propagates vegetatively by lateral branches called offsets, spreading rapidly over water bodies.'
    },
    {
      id: 'q057', chapter: 'ch14', subSkill: 'ss27', bloomLevel: 'remember', weightage: 6, year: 2024,
      text: 'Juvenile phase in animals is equivalent to which phase in flowering plants?',
      options: ['Vegetative phase', 'Senescent phase', 'Reproductive phase', 'Maturation phase'],
      correct: 0,
      explanation: 'The period of vegetative growth before flowering in plants is equivalent to the juvenile phase in animals.'
    },
    {
      id: 'q058', chapter: 'ch15', subSkill: 'ss20', bloomLevel: 'understand', weightage: 7, year: 2023,
      text: 'Double fertilization in angiosperms involves the fusion of male gametes with:',
      options: [
        'Egg cell and polar nuclei / central cell',
        'Two synergids',
        'Antipodal cells and central cell',
        'Egg cell and synergid'
      ],
      correct: 0,
      explanation: 'One male gamete fuses with the egg cell (syngamy) and the second fuses with 2 polar nuclei in central cell (triple fusion = 3n endosperm).'
    },
    {
      id: 'q059', chapter: 'ch15', subSkill: 'ss20', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'The persistent residual nucellus found in black pepper and beet seeds is called:',
      options: ['Perisperm', 'Endosperm', 'Pericarp', 'Scutellum'],
      correct: 0,
      explanation: 'In some seeds like black pepper and beet, remnants of the nucellus persist as a nutritive layer called perisperm.'
    },
    {
      id: 'q060', chapter: 'ch16', subSkill: 'ss17', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'The LH surge in human females triggers which critical reproductive event around day 14 of menstrual cycle?',
      options: ['Ovulation and rupture of Graafian follicle', 'Menstruation', 'Implantation', 'Degeneration of corpus luteum'],
      correct: 0,
      explanation: 'Rapid LH surge at mid-cycle induces rupture of the mature Graafian follicle and release of the secondary oocyte (ovulation).'
    },
    {
      id: 'q061', chapter: 'ch16', subSkill: 'ss17', bloomLevel: 'remember', weightage: 8, year: 2024,
      text: 'Sertoli cells (nurse cells) in the seminiferous tubules provide nutrition to:',
      options: ['Developing spermatozoa', 'Leydig cells', 'Follicular cells', 'Corpus albicans'],
      correct: 0,
      explanation: 'Sertoli cells line the seminiferous tubules and provide structural support and nourishment to developing sperm cells.'
    },
    {
      id: 'q062', chapter: 'ch17', subSkill: 'ss28', bloomLevel: 'remember', weightage: 5, year: 2023,
      text: 'Copper-releasing IUDs like CuT and Multiload-375 prevent conception primarily by:',
      options: [
        'Suppressing sperm motility and fertilizing capacity',
        'Inhibiting ovulation directly in all cycles',
        'Blocking fallopian tubes surgically',
        'Preventing milk ejection'
      ],
      correct: 0,
      explanation: 'Cu ions released by copper IUDs suppress sperm motility and reducing their viability and fertilizing capacity.'
    },
    {
      id: 'q063', chapter: 'ch17', subSkill: 'ss28', bloomLevel: 'remember', weightage: 5, year: 2022,
      text: 'Saheli, a non-steroidal oral contraceptive pill taken once a week, was developed by scientists at:',
      options: ['CDRI, Lucknow', 'AIIMS, New Delhi', 'IISc, Bangalore', 'NII, New Delhi'],
      correct: 0,
      explanation: 'Saheli contains centchroman (ormeloxifene) and was developed by the Central Drug Research Institute (CDRI) in Lucknow.'
    },
    {
      id: 'q064', chapter: 'ch17', subSkill: 'ss28', bloomLevel: 'understand', weightage: 5, year: 2024,
      text: 'In ZIFT (Zygote Intra-Fallopian Transfer) assisted reproductive technique, embryos are transferred at what stage?',
      options: ['Zygote or early embryo up to 8 blastomeres', 'Blastocyst of 32 blastomeres into uterus', 'Morula directly into ovary', 'Unfertilized ovum into uterus'],
      correct: 0,
      explanation: 'In ZIFT, zygote or early embryos up to 8 blastomeres are transferred into the fallopian tube (whereas >8 blastomeres is IUT into uterus).'
    },
    {
      id: 'q065', chapter: 'ch18', subSkill: 'ss10', bloomLevel: 'understand', weightage: 9, year: 2023,
      text: 'In a monohybrid cross with incomplete dominance (e.g., Mirabilis jalapa / Snapdragon), the F2 phenotypic ratio is:',
      options: ['1 : 2 : 1', '3 : 1', '9 : 3 : 3 : 1', '1 : 1'],
      correct: 0,
      explanation: 'In incomplete dominance, RR (red), Rr (pink), and rr (white) yield both 1:2:1 genotypic and 1:2:1 phenotypic ratios in F2.'
    },
    {
      id: 'q066', chapter: 'ch18', subSkill: 'ss13', bloomLevel: 'remember', weightage: 9, year: 2024,
      text: 'Down syndrome in humans is caused by which chromosomal aberration?',
      options: ['Trisomy of chromosome 21 (47, +21)', 'Monosomy of X chromosome (45, X0)', 'XXY genotype (47, XXY)', 'Trisomy of chromosome 18'],
      correct: 0,
      explanation: 'Down syndrome is caused by the presence of an extra copy of autosomal chromosome 21 (trisomy 21).'
    },
    {
      id: 'q067', chapter: 'ch19', subSkill: 'ss12', bloomLevel: 'understand', weightage: 9, year: 2023,
      text: 'In the lac operon of E. coli, the inducer molecule that binds to the repressor protein is:',
      options: ['Allolactose / Lactose', 'Glucose', 'Galactose', 'cAMP'],
      correct: 0,
      explanation: 'Lactose (converted to allolactose) binds to the lac repressor, causing a conformational change that prevents it from binding the operator.'
    },
    {
      id: 'q068', chapter: 'ch19', subSkill: 'ss11', bloomLevel: 'remember', weightage: 9, year: 2024,
      text: 'Which codon acts as both the initiation codon for protein translation and codes for methionine?',
      options: ['AUG', 'UAA', 'UAG', 'UGA'],
      correct: 0,
      explanation: 'AUG functions as the start codon and codes for methionine in eukaryotes and N-formylmethionine in prokaryotes.'
    },
    {
      id: 'q069', chapter: 'ch20', subSkill: 'ss21', bloomLevel: 'understand', weightage: 5, year: 2023,
      text: 'Homologous organs like the forelimbs of humans, cheetahs, whales, and bats indicate:',
      options: ['Divergent evolution and common ancestry', 'Convergent evolution only', 'Parallel mutation', 'No evolutionary relationship'],
      correct: 0,
      explanation: 'Homologous structures share identical anatomical origin and structural design but perform different functions (divergent evolution).'
    },
    {
      id: 'q070', chapter: 'ch20', subSkill: 'ss21', bloomLevel: 'remember', weightage: 5, year: 2024,
      text: 'The first cellular forms of life on Earth appeared approximately how many billion years ago?',
      options: ['2000 million (2 billion) years ago', '4.5 billion years ago', '500 million years ago', '100 million years ago'],
      correct: 0,
      explanation: 'The first cellular life forms originated about 2000 million (2 billion) years ago in primordial oceans.'
    },
    {
      id: 'q071', chapter: 'ch21', subSkill: 'ss16', bloomLevel: 'remember', weightage: 7, year: 2023,
      text: 'Which antibody isotype is present abundantly in colostrum (first mother’s milk) to provide passive immunity to newborns?',
      options: ['IgA', 'IgG', 'IgM', 'IgE'],
      correct: 0,
      explanation: 'Secretory IgA antibodies are rich in colostrum and protect the infant mucosal membranes.'
    },
    {
      id: 'q072', chapter: 'ch21', subSkill: 'ss16', bloomLevel: 'understand', weightage: 7, year: 2024,
      text: 'In malignant tumors, cells detach and migrate to distant sites via blood to form secondary tumors. This property is called:',
      options: ['Metastasis', 'Contact inhibition', 'Transformation', 'Angiogenesis'],
      correct: 0,
      explanation: 'Metastasis is the spread of cancerous cells from the primary site to distant organs through blood or lymph.'
    },
    {
      id: 'q073', chapter: 'ch22', subSkill: 'ss23', bloomLevel: 'remember', weightage: 5, year: 2022,
      text: 'The ability of a single plant cell/explant to regenerate into a whole complete plant is termed:',
      options: ['Totipotency', 'Micropropagation', 'Somaclonal variation', 'Biofortification'],
      correct: 0,
      explanation: 'Totipotency is the inherent cellular capacity of an explant to develop into a full plant when provided with appropriate nutrients and hormones.'
    },
    {
      id: 'q074', chapter: 'ch22', subSkill: 'ss23', bloomLevel: 'remember', weightage: 5, year: 2024,
      text: 'Breeding crops with higher levels of vitamins, minerals, and healthier proteins to improve public health is called:',
      options: ['Biofortification', 'Biomagnification', 'Bioremediation', 'Micropropagation'],
      correct: 0,
      explanation: 'Biofortification is the agronomic and genetic enhancement of crop nutritional quality (e.g., Atlas 66 wheat with high protein).'
    },
    {
      id: 'q075', chapter: 'ch23', subSkill: 'ss29', bloomLevel: 'remember', weightage: 4, year: 2023,
      text: 'Which fungus is used for the commercial production of cyclosporin A, an immunosuppressive agent used in organ transplant patients?',
      options: ['Trichoderma polysporum', 'Monascus purpureus', 'Aspergillus niger', 'Penicillium notatum'],
      correct: 0,
      explanation: 'Trichoderma polysporum produces cyclosporin A, which suppresses T-cell mediated graft rejection in organ transplant recipients.'
    },
    {
      id: 'q076', chapter: 'ch23', subSkill: 'ss29', bloomLevel: 'remember', weightage: 4, year: 2022,
      text: 'Statins used as blood cholesterol lowering agents are commercially derived from which yeast?',
      options: ['Monascus purpureus', 'Saccharomyces cerevisiae', 'Trichoderma', 'Streptococcus'],
      correct: 0,
      explanation: 'Monascus purpureus produces statins, which competitively inhibit HMG-CoA reductase involved in cholesterol synthesis.'
    },
    {
      id: 'q077', chapter: 'ch23', subSkill: 'ss29', bloomLevel: 'understand', weightage: 4, year: 2024,
      text: 'During secondary sewage treatment, high BOD (Biochemical Oxygen Demand) indicates:',
      options: ['High polluting potential of water', 'Very clean water with high dissolved oxygen', 'Complete mineralisation', 'Absence of organic matter'],
      correct: 0,
      explanation: 'BOD measures oxygen required by microbes to decompose organic matter; higher BOD means higher organic pollution.'
    },
    {
      id: 'q078', chapter: 'ch24', subSkill: 'ss19', bloomLevel: 'remember', weightage: 7, year: 2023,
      text: 'The DNA fragments separated on an agarose gel electrophoresis are visualized after staining with:',
      options: ['Ethidium bromide under UV radiation', 'Methylene blue under white light', 'Acetocarmine', 'Safranin'],
      correct: 0,
      explanation: 'Ethidium bromide intercalates between DNA base pairs and fluoresces bright orange under ultraviolet (UV) illumination.'
    },
    {
      id: 'q079', chapter: 'ch24', subSkill: 'ss19', bloomLevel: 'understand', weightage: 7, year: 2024,
      text: 'In PCR (Polymerase Chain Reaction), the three successive steps in each cycle are:',
      options: [
        'Denaturation → Annealing → Extension',
        'Annealing → Denaturation → Ligation',
        'Extension → Denaturation → Annealing',
        'Denaturation → Extension → Ligation'
      ],
      correct: 0,
      explanation: 'PCR cycles proceed by: 1. Denaturation (94°C) → 2. Primer Annealing (50–60°C) → 3. Taq Polymerase Extension (72°C).'
    },
    {
      id: 'q080', chapter: 'ch25', subSkill: 'ss30', bloomLevel: 'remember', weightage: 6, year: 2023,
      text: 'The first clinical gene therapy was performed in 1990 on a 4-year-old girl suffering from deficiency of:',
      options: ['Adenosine deaminase (ADA)', 'Insulin', 'Alpha-1-antitrypsin', 'Phenylalanine hydroxylase'],
      correct: 0,
      explanation: 'Gene therapy was first administered in 1990 to treat severe combined immunodeficiency (SCID) caused by ADA enzyme deficiency.'
    },
    {
      id: 'q081', chapter: 'ch25', subSkill: 'ss30', bloomLevel: 'understand', weightage: 6, year: 2024,
      text: 'Bt toxin protein produced by Bacillus thuringiensis does not kill the bacterium itself because it exists as:',
      options: ['Inactive protoxin', 'An encapsulated crystal in spore wall', 'Degraded peptide', 'RNA transcript only'],
      correct: 0,
      explanation: 'Bt toxin exists as an inactive protoxin crystal and is converted into active toxin only in the alkaline gut pH of target insects.'
    },
    {
      id: 'q082', chapter: 'ch25', subSkill: 'ss30', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'In RNA interference (RNAi), gene silencing is triggered by which double-stranded molecule?',
      options: ['dsRNA (double-stranded RNA)', 'ssDNA', 'tRNA', 'snRNA'],
      correct: 0,
      explanation: 'RNAi utilizes double-stranded RNA (dsRNA) which binds and cleaves specific mRNA to prevent its translation.'
    },
    {
      id: 'q083', chapter: 'ch26', subSkill: 'ss31', bloomLevel: 'understand', weightage: 5, year: 2023,
      text: 'Gause’s Competitive Exclusion Principle states that:',
      options: [
        'Two closely related species competing for the same limiting resources cannot coexist indefinitely',
        'Predators always drive prey to extinction',
        'Species always evolve mutualistic relationships',
        'Larger animals outcompete smaller ones in all habitats'
      ],
      correct: 0,
      explanation: 'Gause’s principle states that two species competing for identical limiting resources cannot coexist if other ecological factors remain constant.'
    },
    {
      id: 'q084', chapter: 'ch26', subSkill: 'ss31', bloomLevel: 'remember', weightage: 5, year: 2024,
      text: 'An interaction where one species is benefited and the other is neither harmed nor benefited (+/0) is called:',
      options: ['Commensalism', 'Amensalism', 'Mutualism', 'Parasitism'],
      correct: 0,
      explanation: 'Commensalism is a (+/0) interaction, e.g., an orchid growing as an epiphyte on a mango branch.'
    },
    {
      id: 'q085', chapter: 'ch26', subSkill: 'ss31', bloomLevel: 'understand', weightage: 5, year: 2022,
      text: 'Allen’s Rule states that mammals from colder climates generally possess:',
      options: ['Shorter ears and shorter limbs to minimize heat loss', 'Larger surface area to volume ratio', 'Absence of blubber/fat layer', 'Longer extremities'],
      correct: 0,
      explanation: 'Allen’s rule explains that homeothermic animals in colder climates have shorter extremities to reduce heat radiation.'
    },
    {
      id: 'q086', chapter: 'ch27', subSkill: 'ss18', bloomLevel: 'remember', weightage: 6, year: 2023,
      text: 'In an aquatic ecosystem (like a deep lake), the pyramid of biomass is generally:',
      options: ['Inverted', 'Upright', 'Spindle-shaped', 'Variable'],
      correct: 0,
      explanation: 'In aquatic ecosystems, phytoplankton have rapid turnover and low standing crop biomass compared to zooplankton/fishes, producing an inverted biomass pyramid.'
    },
    {
      id: 'q087', chapter: 'ch27', subSkill: 'ss18', bloomLevel: 'understand', weightage: 6, year: 2024,
      text: 'The rate of production of organic matter during photosynthesis by producers minus respiration loss (GPP − R) is termed:',
      options: ['Net Primary Productivity (NPP)', 'Gross Primary Productivity (GPP)', 'Secondary Productivity', 'Net Community Production'],
      correct: 0,
      explanation: 'Net Primary Productivity (NPP = GPP − R) is the biomass available for consumption by heterotrophs.'
    },
    {
      id: 'q088', chapter: 'ch28', subSkill: 'ss32', bloomLevel: 'remember', weightage: 5, year: 2023,
      text: 'Which of the following is an ex-situ conservation strategy for endangered species?',
      options: ['Zoological parks and seed banks', 'National Parks', 'Biosphere Reserves', 'Sacred Groves'],
      correct: 0,
      explanation: 'Ex-situ conservation involves protecting organisms outside their natural habitats in zoological parks, botanical gardens, and cryogenic seed banks.'
    },
    {
      id: 'q089', chapter: 'ch28', subSkill: 'ss32', bloomLevel: 'remember', weightage: 5, year: 2022,
      text: 'According to Alexander von Humboldt, species richness within a region increases with increasing explored area, up to a limit, represented by a rectangular hyperbola. The logarithmic equation is:',
      options: ['log S = log C + Z log A', 'S = C A^Z', 'log S = log Z + C log A', 'S = Z A^C'],
      correct: 0,
      explanation: 'The Species-Area relationship on a log scale is linear: log S = log C + Z log A (where S=Species richness, A=Area, Z=slope, C=Y-intercept).'
    },
    {
      id: 'q090', chapter: 'ch28', subSkill: 'ss32', bloomLevel: 'remember', weightage: 5, year: 2024,
      text: 'The Earth Summit on Biodiversity and Sustainable Development (1992) was held in:',
      options: ['Rio de Janeiro, Brazil', 'Johannesburg, South Africa', 'Kyoto, Japan', 'Montreal, Canada'],
      correct: 0,
      explanation: 'The historic Earth Summit (UNCED) was held in Rio de Janeiro in 1992 to promote biodiversity conservation.'
    }
  ],

  /* ---- Foundation Assessment Questions (subset) ---- */
  foundationQuestions: ['q001','q002','q003','q004','q005','q006','q007','q008','q009','q010',
                         'q011','q012','q013','q014','q015','q016','q017','q018','q019','q020'],

  /* ---- Error Types ---- */
  errorTypes: [
    { id: 'conceptual_gap', label: 'Concept not clear', icon: '🧠', description: 'Did not know or understand the core concept' },
    { id: 'misread_question', label: 'Misread question', icon: '👀', description: 'Missed NOT, EXCEPT, or a key detail in the question stem' },
    { id: 'calculation_error', label: 'Calculation error', icon: '🔢', description: 'Arithmetic or formula application mistake' },
    { id: 'memory_lapse', label: 'Forgot fact/name', icon: '❓', description: 'Knew the topic but forgot the specific term or value' },
    { id: 'time_pressure', label: 'Rushed answer', icon: '⏱️', description: 'Answered too quickly under time pressure' },
  ],

  /* ---- Initial Weakness Map (computed dynamically on student test attempts) ---- */
  weaknessMap: [],

  /* ---- Initial Spaced Retest Schedule (populated dynamically on test review) ---- */
  spacedRetestSchedule: [],

  /* ---- Initial Student Performance Template --- */
  performance: {
    studentName: '',
    overallAccuracy: 0,
    testsAttempted: 0,
    questionsAttempted: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unattempted: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: null,
    totalStudents: 1,
    percentile: 0,
    weeklyProgress: [0],
    badges: [
      { id: 'b01', name: '7-Day Streak',   icon: '🔥', earned: false },
      { id: 'b02', name: 'First Test',     icon: '⭐', earned: false },
      { id: 'b03', name: 'Perfect Score',  icon: '💯', earned: false },
      { id: 'b04', name: 'Top 1%',         icon: '🏆', earned: false },
      { id: 'b05', name: 'Speed Demon',    icon: '⚡', earned: false },
      { id: 'b06', name: 'Consistent',     icon: '📈', earned: false },
    ],
    chapterProgress: {},
    chapterTestHistorySeed: [],
    fullLengthHistorySeed: [],
  },

  /* ---- Spaced Review Pool (populated dynamically on test mistakes) ---- */
  spacedReviewSeed: [],

  /* ---- Homepage Slides ---- */
  homeSlides: [
    {
      id: 's1',
      tag: '⚡ 100% HIGH YIELD',
      emoji: '🧬',
      title: 'Stop cramming. Start dominating.',
      subtitle: 'Break 28 chapters into high-yield sub-skills. Understand mechanisms, predict the questions.',
      cta: 'Explore Chapters',
      screen: 'chapter-test',
      theme: 'emerald'
    },
    {
      id: 's2',
      tag: '🔥 LOCK IN PROTOCOL',
      emoji: '⚡',
      title: 'Consistency is your superpower.',
      subtitle: '10 focused questions a day beats 10 hours of panic. Keep the streak burning.',
      cta: 'Start Daily Practice',
      screen: 'chapter-test',
      theme: 'sunset'
    },
    {
      id: 's3',
      tag: '🎯 ZERO REGRETS',
      emoji: '💡',
      title: 'Turn wrong answers into rank fuel.',
      subtitle: 'Auto-tag conceptual slips & silly mistakes. Re-test on Day 1, 4, 10 until 100% locked in.',
      cta: 'Open Improvement Book',
      screen: 'improvement-book',
      theme: 'violet'
    },
  ],

  /* ---- Full-Length Mock Tests (NEET & CUET UG) ---- */
  fullLengthTests: [
    {
      id: 'flt_01',
      title: 'Full Length Test 1',
      description: 'Comprehensive NEET pattern test covering all 28 Biology chapters (Class 11th & 12th).',
      numberOfQuestions: 90,
      durationMinutes: 45,
      examType: 'NEET',
      maxMarks: 360,
      questions: []
    },
    {
      id: 'flt_02',
      title: 'Full Length Test 2',
      description: 'High-yield full syllabus NEET mock test with balanced Botany & Zoology weightage.',
      numberOfQuestions: 90,
      durationMinutes: 45,
      examType: 'NEET',
      maxMarks: 360,
      questions: []
    },
    {
      id: 'flt_03',
      title: 'Full Length Test 3',
      description: 'Advanced difficulty full syllabus NEET mock test with A&R and diagram questions.',
      numberOfQuestions: 90,
      durationMinutes: 45,
      examType: 'NEET',
      maxMarks: 360,
      questions: []
    },
    {
      id: 'flt_04',
      title: 'Full Length Test 4',
      description: 'NEET speed drill mock test to master accuracy and time management under pressure.',
      numberOfQuestions: 90,
      durationMinutes: 45,
      examType: 'NEET',
      maxMarks: 360,
      questions: []
    },
    {
      id: 'flt_cuet_01',
      title: 'CUET UG Biology Mock Test 1',
      description: 'NTA CUET (UG) official pattern: 50 Questions, +5/−1 marking (250 Marks). 100% Class 12th NCERT Syllabus.',
      numberOfQuestions: 50,
      durationMinutes: 45,
      examType: 'CUET',
      maxMarks: 250,
      questions: []
    },
    {
      id: 'flt_cuet_02',
      title: 'CUET UG Biology Mock Test 2',
      description: 'Comprehensive Class 12th NCERT CUET Mock with Case-Study & Assertion-Reason drills (250 Marks).',
      numberOfQuestions: 50,
      durationMinutes: 45,
      examType: 'CUET',
      maxMarks: 250,
      questions: []
    }
  ],

  /* ---- Badge descriptions ---- */
  badgeDescriptions: {
    'b01': 'Log in 7 days in a row',
    'b02': 'Complete your first test',
    'b03': 'Score 100% on any test',
    'b04': 'Reach the top 1% of all students',
    'b05': 'Finish a test in under half the time limit',
    'b06': 'Maintain a streak for 14 days',
  },

  /* ---- NCERT Bio Focus Seed Questions (Line-by-line NEET Biology) ---- */
  ncertQuestions: [
    {
      id: 'ncert_01',
      chapter: 'ch01',
      class: '11',
      topic: 'Cell Membrane & Fluid Mosaic Model',
      questionType: 'mcq',
      difficulty: 'medium',
      text: 'According to the fluid mosaic model of cell membrane proposed by Singer and Nicolson (1972), the quasi-fluid nature of lipid enables:',
      options: [
        'Lateral movement of proteins within the overall bilayer',
        'Flip-flop movement of proteins exclusively',
        'Complete rigidity and static positioning of membrane lipids',
        'Synthesis of carbohydrates directly on the hydrophobic core'
      ],
      correct: 0,
      explanation: 'NCERT states: The quasi-fluid nature of lipid enables lateral movement of proteins within the overall bilayer. This ability to move within the membrane is measured as its fluidity.',
      ncertReference: 'NCERT Class 11, Chapter 8 (Cell: The Unit of Life), Page 131-132',
      isNcertFocus: true
    },
    {
      id: 'ncert_02',
      chapter: 'ch01',
      class: '11',
      topic: 'Ribosomes & Endomembrane System',
      questionType: 'assertion_reason',
      difficulty: 'hard',
      text: 'Read the assertion and reason carefully and choose the correct option:',
      assertion: 'Ribosomes are non-membrane bound organelles found in both eukaryotic and prokaryotic cells.',
      reason: 'Ribosomes in eukaryotic cells are exclusively restricted to the cytoplasm and rough endoplasmic reticulum.',
      options: [
        'Both Assertion and Reason are true and Reason is the correct explanation of Assertion.',
        'Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.',
        'Assertion is true but Reason is false.',
        'Assertion is false but Reason is true.'
      ],
      correct: 2,
      explanation: 'Assertion is true (Ribosomes are universal non-membrane bound organelles). Reason is false because eukaryotic ribosomes are also found within mitochondria and chloroplasts (as 70S ribosomes), not exclusively in the cytoplasm and RER.',
      ncertReference: 'NCERT Class 11, Chapter 8, Page 128 (Overview of Cell)',
      isNcertFocus: true
    },
    {
      id: 'ncert_03',
      chapter: 'ch03',
      class: '11',
      topic: 'Proteins and Biomacromolecules',
      questionType: 'matching',
      difficulty: 'medium',
      text: 'Match the proteins/molecules in Column-I with their respective biological functions in Column-II according to NCERT Table 9.5:',
      columnA: ['A. Collagen', 'B. Trypsin', 'C. Insulin', 'D. GLUT-4'],
      columnB: ['1. Intercellular ground substance', '2. Enzyme', '3. Hormone', '4. Enables glucose transport into cells'],
      options: [
        'A-1, B-2, C-3, D-4',
        'A-4, B-3, C-2, D-1',
        'A-1, B-3, C-2, D-4',
        'A-2, B-1, C-4, D-3'
      ],
      correct: 0,
      explanation: 'As per NCERT Table 9.5 (Some Proteins and their Functions): Collagen = Intercellular ground substance; Trypsin = Enzyme; Insulin = Hormone; GLUT-4 = Enables glucose transport into cells.',
      ncertReference: 'NCERT Class 11, Chapter 9 (Biomolecules), Page 147, Table 9.5',
      isNcertFocus: true
    },
    {
      id: 'ncert_04',
      chapter: 'ch01',
      class: '11',
      topic: 'Mitochondria Structure',
      questionType: 'diagram',
      difficulty: 'medium',
      diagramUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
      text: 'In a typical mitochondrion, the inner membrane forms a number of infoldings called cristae towards the matrix. What is the primary functional significance of cristae according to NCERT?',
      options: [
        'They increase the surface area for ATP synthesizing enzymatic complexes',
        'They store calcium ions and glycogen granules exclusively',
        'They prevent the passage of protons into the intermembrane space',
        'They synthesize ribosomes and transfer RNA directly'
      ],
      correct: 0,
      explanation: 'NCERT line: The cristae increase the surface area. The two membranes have their own specific enzymes associated with the mitochondrial function.',
      ncertReference: 'NCERT Class 11, Chapter 8, Page 135 (Mitochondria)',
      isNcertFocus: true
    },
    {
      id: 'ncert_05',
      chapter: 'ch04',
      class: '11',
      topic: 'C4 Pathway (Hatch & Slack)',
      questionType: 'mcq',
      difficulty: 'hard',
      text: 'In C4 plants (e.g., Maize, Sorghum), the primary CO2 acceptor is PEP, which is present in the mesophyll cells. The enzyme responsible for this fixation is:',
      options: [
        'PEP carboxylase (PEPcase)',
        'RuBisCO',
        'Carbonic anhydrase',
        'Pyruvate dehydrogenase'
      ],
      correct: 0,
      explanation: 'NCERT line: The primary CO2 acceptor is a 3-carbon molecule phosphoenolpyruvate (PEP) and is present in the mesophyll cells. The enzyme responsible for this fixation is PEP carboxylase or PEPcase. The mesophyll cells of C4 plants lack RuBisCO enzyme.',
      ncertReference: 'NCERT Class 11, Chapter 13 (Photosynthesis in Higher Plants), Page 218',
      isNcertFocus: true
    },
    {
      id: 'ncert_06',
      chapter: 'ch18',
      class: '12',
      topic: 'Linkage and Recombination',
      questionType: 'mcq',
      difficulty: 'medium',
      text: 'In Morgan’s dihybrid cross with Drosophila for body color and eye color (yellow-body, white-eyed females × brown-body, red-eyed males), the percentage of parental type progeny obtained in F2 was:',
      options: [
        '98.7%',
        '62.8%',
        '37.2%',
        '1.3%'
      ],
      correct: 0,
      explanation: 'NCERT line: Morgan and his group found that when genes were grouped on the same chromosome, some genes were very tightly linked and showed very low recombination. For yellow body and white eye, parental type was 98.7% and recombinant type was 1.3%.',
      ncertReference: 'NCERT Class 12, Chapter 5 (Principles of Inheritance and Variation), Page 83',
      isNcertFocus: true
    },
    {
      id: 'ncert_07',
      chapter: 'ch18',
      class: '12',
      topic: 'Mendelian Disorders',
      questionType: 'assertion_reason',
      difficulty: 'hard',
      text: 'Analyze the following Assertion and Reason on Sickle-cell anemia:',
      assertion: 'In sickle-cell anemia, the mutant hemoglobin molecule undergoes polymerization under low oxygen tension causing the change in shape of RBC.',
      reason: 'The substitution of Glutamic acid (Glu) by Valine (Val) occurs at the sixth position of the alpha-globin chain of the hemoglobin molecule.',
      options: [
        'Both Assertion and Reason are true and Reason is the correct explanation of Assertion.',
        'Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.',
        'Assertion is true but Reason is false.',
        'Both Assertion and Reason are false.'
      ],
      correct: 2,
      explanation: 'Assertion is true. Reason is false because the substitution occurs at the sixth position of the beta (β) globin chain, NOT the alpha (α) globin chain.',
      ncertReference: 'NCERT Class 12, Chapter 5, Page 89-90 (Sickle-Cell Anemia)',
      isNcertFocus: true
    },
    {
      id: 'ncert_08',
      chapter: 'ch19',
      class: '12',
      topic: 'Transcription & RNA Polymerase',
      questionType: 'mcq',
      difficulty: 'medium',
      text: 'In eukaryotes, RNA Polymerase III is responsible for the transcription of which of the following RNA molecules according to NCERT?',
      options: [
        'tRNA, 5S rRNA, and snRNAs',
        'rRNAs (28S, 18S, and 5.8S)',
        'Precursor of mRNA (hnRNA)',
        'Only 28S rRNA'
      ],
      correct: 0,
      explanation: 'NCERT line: RNA polymerase I transcribes rRNAs (28S, 18S, and 5.8S); RNA polymerase II transcribes precursor of mRNA (hnRNA); RNA polymerase III is responsible for transcription of tRNA, 5S rRNA, and snRNAs.',
      ncertReference: 'NCERT Class 12, Chapter 6 (Molecular Basis of Inheritance), Page 111',
      isNcertFocus: true
    },
    {
      id: 'ncert_09',
      chapter: 'ch24',
      class: '12',
      topic: 'Restriction Enzymes & Cloning Tools',
      questionType: 'matching',
      difficulty: 'medium',
      text: 'Match the tools/enzymes in Column-I with their respective source/function in Column-II:',
      columnA: ['A. EcoRI', 'B. Taq polymerase', 'C. Exonucleases', 'D. Plasmids'],
      columnB: ['1. Thermus aquaticus', '2. Autonomously replicating circular extra-chromosomal DNA', '3. Specific recognition sequence 5′-GAATTC-3′', '4. Remove nucleotides from the ends of the DNA'],
      options: [
        'A-3, B-1, C-4, D-2',
        'A-1, B-3, C-2, D-4',
        'A-3, B-4, C-1, D-2',
        'A-4, B-1, C-3, D-2'
      ],
      correct: 0,
      explanation: 'As per NCERT Chapter 11: EcoRI recognizes 5\'-GAATTC-3\'; Taq polymerase is isolated from Thermus aquaticus; Exonucleases remove nucleotides from DNA ends; Plasmids are autonomously replicating circular extra-chromosomal DNA.',
      ncertReference: 'NCERT Class 12, Chapter 11 (Biotechnology: Principles and Processes), Page 194-203',
      isNcertFocus: true
    },
    {
      id: 'ncert_10',
      chapter: 'ch15',
      class: '12',
      topic: 'Structure of Anatropous Ovule',
      questionType: 'diagram',
      difficulty: 'medium',
      diagramUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
      text: 'In a typical angiospermic anatropous ovule, the junction where the body of the ovule fuses with the funicle is called:',
      options: [
        'Hilum',
        'Micropyle',
        'Chalaza',
        'Integument'
      ],
      correct: 0,
      explanation: 'NCERT line: The ovule is a small structure attached to the placenta by means of a stalk called funicle. The body of the ovule fuses with funicle in the region called hilum. Thus, hilum represents the junction between ovule and funicle.',
      ncertReference: 'NCERT Class 12, Chapter 2 (Sexual Reproduction in Flowering Plants), Page 25',
      isNcertFocus: true
    }
  ],

  /* ---- CUET UG Biology PYQ Question Bank (100% Class 12th NCERT) ---- */
  cuetQuestions: [
    {
      id: 'cuet_q01',
      chapter: 'ch20',
      subSkill: 'ss20',
      year: 2024,
      shift: 'May 15 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In an angiosperm embryo sac, the filiform apparatus is a characteristic cellular thickening present in:',
      options: ['Synergids', 'Antipodal cells', 'Central cell', 'Egg cell'],
      correct: 0,
      correctOption: 0,
      explanation: 'The synergids have special cellular thickenings at the micropylar tip called filiform apparatus, which play an important role in guiding the pollen tubes into the synergid.',
      ncertReference: 'NCERT Class 12, Chapter 2 (Sexual Reproduction in Flowering Plants), Page 27',
    },
    {
      id: 'cuet_q02',
      chapter: 'ch21',
      subSkill: 'ss17',
      year: 2024,
      shift: 'May 15 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which hormone is exclusively secreted during pregnancy in human females by the placenta?',
      options: ['Estrogen', 'Progesterone', 'hCG and hPL', 'LH and FSH'],
      correct: 2,
      correctOption: 2,
      explanation: 'Human chorionic gonadotropin (hCG), human placental lactogen (hPL), and relaxin (in later pregnancy) are produced in women only during pregnancy.',
      ncertReference: 'NCERT Class 12, Chapter 3 (Human Reproduction), Page 53',
    },
    {
      id: 'cuet_q03',
      chapter: 'ch22',
      subSkill: 'ss17',
      year: 2024,
      shift: 'May 17 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Saheli, a non-steroidal oral contraceptive pill for females developed by CDRI Lucknow, is taken:',
      options: ['Daily without break', 'Once a week after an initial intake of twice a week for 3 months', 'Once a month', 'Only post-coitus within 72 hours'],
      correct: 1,
      correctOption: 1,
      explanation: 'Saheli is a novel non-steroidal pill (Centchroman) taken once a week after an initial 3-month schedule of twice a week. It has very few side effects and high contraceptive value.',
      ncertReference: 'NCERT Class 12, Chapter 4 (Reproductive Health), Page 61',
    },
    {
      id: 'cuet_q04',
      chapter: 'ch23',
      subSkill: 'ss13',
      year: 2024,
      shift: 'May 21 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In a dihybrid cross performed by T.H. Morgan on Drosophila with yellow body, white eyes crossed with brown body, red eyes, the parental type frequency was 98.7% and recombinant frequency was 1.3%. This demonstrated:',
      options: ['Independent assortment of non-homologous chromosomes', 'Complete absence of crossing over', 'Tight linkage between genes on the X-chromosome', 'Polygenic inheritance'],
      correct: 2,
      correctOption: 2,
      explanation: 'Morgan attributed the high parental proportion (98.7%) and low recombination (1.3%) to physical association or tight linkage of the two genes on the X chromosome.',
      ncertReference: 'NCERT Class 12, Chapter 5 (Principles of Inheritance and Variation), Page 83',
    },
    {
      id: 'cuet_q05',
      chapter: 'ch24',
      subSkill: 'ss12',
      year: 2024,
      shift: 'May 21 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'case_study',
      caseStudyPassage: 'A molecular biology research team carried out DNA sequencing on a bacterial Lac operon mutant. They observed that beta-galactosidase was synthesized constitutively even in the absolute absence of lactose/allolactose in the growth medium. Sequencing revealed a point mutation in the operator sequence (Oᶜ) that prevented the lac repressor protein from binding.',
      text: 'Based on the passage, the constitutive expression of the lac operon in this mutant occurs because:',
      options: ['The repressor protein cannot bind the mutated operator (Oᶜ)', 'RNA polymerase cannot bind the promoter', 'Lactose is continuously synthesized inside the bacterium', 'The structural gene lacZ is deleted'],
      correct: 0,
      correctOption: 0,
      explanation: 'In an operator-constitutive mutant (Oᶜ), the repressor protein fails to bind the altered operator sequence, allowing RNA polymerase uninhibited transcription of lacZ, Y, and A genes.',
      ncertReference: 'NCERT Class 12, Chapter 6 (Molecular Basis of Inheritance), Page 116',
    },
    {
      id: 'cuet_q06',
      chapter: 'ch25',
      subSkill: 'ss21',
      year: 2023,
      shift: 'May 21 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'According to the Hardy-Weinberg equilibrium, if the frequency of a recessive allele (q) in a population is 0.4, what will be the frequency of heterozygous individuals (2pq)?',
      options: ['0.16', '0.48', '0.36', '0.24'],
      correct: 1,
      correctOption: 1,
      explanation: 'Given q = 0.4. Since p + q = 1, p = 1 - 0.4 = 0.6. Frequency of heterozygotes (2pq) = 2 × 0.6 × 0.4 = 0.48.',
      ncertReference: 'NCERT Class 12, Chapter 7 (Evolution), Page 137',
    },
    {
      id: 'cuet_q07',
      chapter: 'ch26',
      subSkill: 'ss16',
      year: 2023,
      shift: 'May 24 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which type of innate immunity barrier do interferons secreted by virus-infected cells represent?',
      options: ['Physical barrier', 'Physiological barrier', 'Cellular barrier', 'Cytokine barrier'],
      correct: 3,
      correctOption: 3,
      explanation: 'Virus-infected cells secrete proteins called interferons which protect non-infected cells from further viral infection. These constitute cytokine barriers.',
      ncertReference: 'NCERT Class 12, Chapter 8 (Human Health and Disease), Page 151',
    },
    {
      id: 'cuet_q08',
      chapter: 'ch27',
      subSkill: 'ss23',
      year: 2023,
      shift: 'June 01 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Statins, used as blood cholesterol lowering agents, are commercially produced from which yeast?',
      options: ['Trichoderma polysporum', 'Monascus purpureus', 'Saccharomyces cerevisiae', 'Aspergillus niger'],
      correct: 1,
      correctOption: 1,
      explanation: 'Statins produced by the yeast Monascus purpureus act by competitively inhibiting the enzyme responsible for cholesterol synthesis (HMG-CoA reductase).',
      ncertReference: 'NCERT Class 12, Chapter 10 (Microbes in Human Welfare), Page 183',
    },
    {
      id: 'cuet_q09',
      chapter: 'ch28',
      subSkill: 'ss19',
      year: 2023,
      shift: 'June 01 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In recombinant DNA technology, the enzyme Taq polymerase obtained from Thermus aquaticus is used in PCR because:',
      options: ['It cuts DNA at palindromic sequences', 'It remains active at high temperatures during denaturation', 'It joins Okazaki fragments', 'It synthesizes RNA primers'],
      correct: 1,
      correctOption: 1,
      explanation: 'Taq polymerase is a thermostable DNA polymerase isolated from bacterium Thermus aquaticus that remains active through the high-temperature denaturation steps (94°C) of PCR.',
      ncertReference: 'NCERT Class 12, Chapter 11 (Biotechnology: Principles and Processes), Page 202',
    },
    {
      id: 'cuet_q10',
      chapter: 'ch29',
      subSkill: 'ss19',
      year: 2022,
      shift: 'July 15 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In Bt cotton, the Bt toxin protein is produced in an inactive protoxin form. It is converted into an active toxin inside the insect gut due to:',
      options: ['Acidic pH of the foregut', 'Alkaline pH of the midgut', 'High body temperature of insect', 'Action of salivary amylase'],
      correct: 1,
      correctOption: 1,
      explanation: 'The inactive protoxin is converted into an active form of toxin due to the alkaline pH of the insect midgut which solubilises the crystals.',
      ncertReference: 'NCERT Class 12, Chapter 12 (Biotechnology and its Applications), Page 208',
    },
    {
      id: 'cuet_q11',
      chapter: 'ch30',
      subSkill: 'ss18',
      year: 2022,
      shift: 'July 15 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'The mathematical expression for Verhulst-Pearl Logistic Growth of a population is:',
      options: ['dN/dt = rN', 'dN/dt = rN ((K - N) / K)', 'dN/dt = rN (K / (K - N))', 'Nt = N0 e^rt'],
      correct: 1,
      correctOption: 1,
      explanation: 'The Verhulst-Pearl logistic growth equation is dN/dt = rN((K - N)/K), where N = population density, r = intrinsic rate of natural increase, and K = carrying capacity.',
      ncertReference: 'NCERT Class 12, Chapter 13 (Organisms and Populations), Page 231',
    },
    {
      id: 'cuet_q12',
      chapter: 'ch31',
      subSkill: 'ss18',
      year: 2022,
      shift: 'August 04 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which of the following ecological pyramids is always upright and can never be inverted in any ecosystem?',
      options: ['Pyramid of biomass', 'Pyramid of numbers', 'Pyramid of energy', 'Pyramid of standing crop'],
      correct: 2,
      correctOption: 2,
      explanation: 'Pyramid of energy is always upright, can never be inverted, because when energy flows from a particular trophic level to the next trophic level, some energy is always lost as heat at each step (10% law).',
      ncertReference: 'NCERT Class 12, Chapter 14 (Ecosystem), Page 249',
    },
    {
      id: 'cuet_q13',
      chapter: 'ch32',
      subSkill: 'ss18',
      year: 2022,
      shift: 'August 04 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which of the following represents an Ex-situ (off-site) strategy for biodiversity conservation?',
      options: ['National Park', 'Biosphere Reserve', 'Sacred Groves', 'Cryopreservation of gametes & Botanical Gardens'],
      correct: 3,
      correctOption: 3,
      explanation: 'Ex-situ conservation involves taking threatened animals and plants out from their natural habitat and placing them in special settings (Botanical Gardens, Zoological Parks, Wildlife Safari Parks, Seed banks, and Cryopreservation).',
      ncertReference: 'NCERT Class 12, Chapter 15 (Biodiversity and Conservation), Page 267',
    },
    {
      id: 'cuet_q14',
      chapter: 'ch23',
      subSkill: 'ss13',
      year: 2024,
      shift: 'May 17 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'case_study',
      caseStudyPassage: 'Pedigree analysis in a human family revealed that an autosomal recessive metabolic disorder causes accumulation of phenylalanine in blood due to lack of the liver enzyme phenylalanine hydroxylase. This condition leads to severe mental retardation, reduction in hair, and skin pigmentation.',
      text: 'Which genetic disorder is described in the case study passage above?',
      options: ['Sickle cell anemia', 'Phenylketonuria (PKU)', 'Thalassemia major', 'Cystic fibrosis'],
      correct: 1,
      correctOption: 1,
      explanation: 'Phenylketonuria (PKU) is an inborn error of metabolism inherited as autosomal recessive trait, caused by mutation in the gene coding for phenylalanine hydroxylase enzyme.',
      ncertReference: 'NCERT Class 12, Chapter 5 (Principles of Inheritance and Variation), Page 91',
    },
    {
      id: 'cuet_q15',
      chapter: 'ch29',
      subSkill: 'ss19',
      year: 2023,
      shift: 'May 24 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'The first clinical gene therapy was given in 1990 to a 4-year-old girl with which enzyme deficiency?',
      options: ['Adenosine deaminase (ADA)', 'Tyrosinase', 'Insulinase', 'Phenylalanine hydroxylase'],
      correct: 0,
      correctOption: 0,
      explanation: 'The first clinical gene therapy was given in 1990 to a 4-year-old girl with adenosine deaminase (ADA) deficiency, which causes severe combined immunodeficiency (SCID).',
      ncertReference: 'NCERT Class 12, Chapter 12 (Biotechnology and its Applications), Page 211',
    },
    {
      id: 'cuet_q16',
      chapter: 'ch20',
      subSkill: 'ss20',
      year: 2023,
      shift: 'May 22 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'assertion_reason',
      text: 'Assertion (A): Cleistogamous flowers produce assured seed-set even in the absence of pollinators.\nReason (R): Cleistogamous flowers do not open at all, ensuring complete autogamy.',
      options: [
        'Both (A) and (R) are true and (R) is the correct explanation of (A)',
        'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
        '(A) is true but (R) is false',
        '(A) is false but (R) is true'
      ],
      correct: 0,
      correctOption: 0,
      explanation: 'Cleistogamous flowers remain closed, preventing cross-pollination. When pollen grains shed inside, autogamy occurs reliably without needing external pollinating agents.',
      ncertReference: 'NCERT Class 12, Chapter 2 (Sexual Reproduction in Flowering Plants), Page 28',
    },
    {
      id: 'cuet_q17',
      chapter: 'ch21',
      subSkill: 'ss17',
      year: 2023,
      shift: 'May 23 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which cells of the human testes synthesize and secrete androgens (testosterone) under LH stimulation?',
      options: ['Sertoli cells', 'Leydig (interstitial) cells', 'Spermatogonia', 'Secondary spermatocytes'],
      correct: 1,
      correctOption: 1,
      explanation: 'Leydig cells (interstitial cells) present in the interstitial spaces between seminiferous tubules produce testicular hormones called androgens.',
      ncertReference: 'NCERT Class 12, Chapter 3 (Human Reproduction), Page 44',
    },
    {
      id: 'cuet_q18',
      chapter: 'ch22',
      subSkill: 'ss17',
      year: 2022,
      shift: 'August 06 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In Intra-Cytoplasmic Sperm Injection (ICSI), fertilization is assisted by:',
      options: [
        'Injecting a sperm directly into the ovum in vitro',
        'Transferring embryo into the fallopian tube',
        'Inseminating semen into the uterus',
        'Transferring ovum into the fallopian tube'
      ],
      correct: 0,
      correctOption: 0,
      explanation: 'ICSI is a specialized ART procedure where a single sperm is directly injected into the ovum under microscope in the laboratory.',
      ncertReference: 'NCERT Class 12, Chapter 4 (Reproductive Health), Page 64',
    },
    {
      id: 'cuet_q19',
      chapter: 'ch24',
      subSkill: 'ss12',
      year: 2023,
      shift: 'May 25 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'During DNA replication in E. coli, Okazaki fragments synthesized on the lagging strand are joined by:',
      options: ['DNA polymerase I', 'DNA ligase', 'RNA primase', 'DNA helicase'],
      correct: 1,
      correctOption: 1,
      explanation: 'DNA ligase facilitates the joining of DNA strands together by catalyzing the formation of phosphodiester bonds between discontinuous Okazaki fragments.',
      ncertReference: 'NCERT Class 12, Chapter 6 (Molecular Basis of Inheritance), Page 107',
    },
    {
      id: 'cuet_q20',
      chapter: 'ch25',
      subSkill: 'ss21',
      year: 2024,
      shift: 'May 16 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'The presence of homologous structures (such as forelimbs of whales, bats, cheetah, and humans) indicates:',
      options: ['Convergent evolution', 'Divergent evolution / Common ancestry', 'Saltation', 'Adaptive convergence'],
      correct: 1,
      correctOption: 1,
      explanation: 'Homologous organs have identical anatomical blueprint but perform different functions, representing divergent evolution resulting from adaptation to different environmental niches.',
      ncertReference: 'NCERT Class 12, Chapter 7 (Evolution), Page 130',
    },
    {
      id: 'cuet_q21',
      chapter: 'ch26',
      subSkill: 'ss16',
      year: 2024,
      shift: 'May 18 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'case_study',
      caseStudyPassage: 'A patient presented with recurrent bouts of high fever with chills returning every 3–4 days. Blood smear confirmed the presence of Plasmodium vivax trophozoites within red blood cells.',
      text: 'The toxic substance responsible for the characteristic chill and high fever recurring every 3 to 4 days in malaria is:',
      options: ['Hemozoin released upon RBC rupture', 'Interferon alpha', 'Histamine from mast cells', 'Tetanospasmin'],
      correct: 0,
      correctOption: 0,
      explanation: 'Rupture of erythrocytic schizonts releases toxic hemozoin crystals into bloodstream which stimulates macrophages to release pyrogens producing chills and fever.',
      ncertReference: 'NCERT Class 12, Chapter 8 (Human Health and Disease), Page 147',
    },
    {
      id: 'cuet_q22',
      chapter: 'ch27',
      subSkill: 'ss23',
      year: 2024,
      shift: 'May 19 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Cyclosporin A, an important immunosuppressive agent used in organ transplant patients, is produced by:',
      options: ['Trichoderma polysporum fungus', 'Monascus purpureus', 'Clostridium butyricum', 'Streptococcus bacterium'],
      correct: 0,
      correctOption: 0,
      explanation: 'Cyclosporin A is produced by the fungus Trichoderma polysporum and is used as an immunosuppressive agent in organ-transplant patients.',
      ncertReference: 'NCERT Class 12, Chapter 10 (Microbes in Human Welfare), Page 183',
    },
    {
      id: 'cuet_q23',
      chapter: 'ch28',
      subSkill: 'ss19',
      year: 2024,
      shift: 'May 22 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In agarose gel electrophoresis, DNA fragments move towards which electrode and are separated on the basis of:',
      options: ['Anode (+ve); based on their size/length', 'Cathode (-ve); based on charge alone', 'Anode (+ve); based on GC content', 'Cathode (-ve); based on shape only'],
      correct: 0,
      correctOption: 0,
      explanation: 'DNA fragments are negatively charged molecules, so they move towards the positive electrode (anode) and are separated by size (sieving effect of agarose).',
      ncertReference: 'NCERT Class 12, Chapter 11 (Biotechnology: Principles and Processes), Page 198',
    },
    {
      id: 'cuet_q24',
      chapter: 'ch30',
      subSkill: 'ss18',
      year: 2023,
      shift: 'May 28 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'The interaction between clown fish living among sea anemone tentacles without harming the anemone is an example of:',
      options: ['Commensalism (+, 0)', 'Mutualism (+, +)', 'Parasitism (+, -)', 'Amensalism (-, 0)'],
      correct: 0,
      correctOption: 0,
      explanation: 'In commensalism, one species benefits (clownfish gets protection from predators) while the host (sea anemone) is neither harmed nor benefited.',
      ncertReference: 'NCERT Class 12, Chapter 13 (Organisms and Populations), Page 237',
    },
    {
      id: 'cuet_q25',
      chapter: 'ch31',
      subSkill: 'ss18',
      year: 2023,
      shift: 'June 02 Slot 2',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'In an ecosystem, what percentage of the total energy available at a trophic level is transferred to the next higher level?',
      options: ['1%', '10%', '50%', '90%'],
      correct: 1,
      correctOption: 1,
      explanation: 'According to Lindeman’s 10 percent law, only about 10% of the energy stored as biomass in one trophic level is passed on to the next trophic level.',
      ncertReference: 'NCERT Class 12, Chapter 14 (Ecosystem), Page 247',
    },
    {
      id: 'cuet_q26',
      chapter: 'ch32',
      subSkill: 'ss18',
      year: 2024,
      shift: 'May 23 Slot 1',
      examType: 'CUET',
      isPyq: true,
      questionType: 'mcq',
      text: 'Which of the following is considered the most significant cause of animal and plant extinctions ("The Evil Quartet") globally?',
      options: ['Habitat loss and fragmentation', 'Over-exploitation', 'Alien species invasions', 'Co-extinctions'],
      correct: 0,
      correctOption: 0,
      explanation: 'Habitat loss and fragmentation is the most important cause driving animals and plants to extinction (e.g. Amazon rainforest deforestation).',
      ncertReference: 'NCERT Class 12, Chapter 15 (Biodiversity and Conservation), Page 264',
    }
  ],
};

/* ---- Weakness Priority Calculation ----
   Formula: severity × NEET weightage × (1 / days-to-exam factor)
   Note: Exact numerical definitions not finalized. Using demo values.
   Replace with backend calculation when ready.
*/
function calculateWeaknessPriority(severity, weightage, daysToExam) {
  const urgencyFactor = daysToExam <= 0 ? 1 : (1 / Math.log(daysToExam + 1));
  return Math.round(severity * weightage * urgencyFactor * 100);
}

/* ---- Compute & sort weakness map priorities ---- */
DB.weaknessMap.forEach(w => {
  w.priority = calculateWeaknessPriority(w.severity, w.weightage, w.daysToExam);
});
DB.weaknessMap.sort((a, b) => b.priority - a.priority);

/* ---- Helper: get question objects by IDs ---- */
function getQuestionsByIds(ids) {
  return ids.map(id => DB.questions.find(q => q.id === id)).filter(Boolean);
}

/* ---- Helper: get chapter questions ---- */
function getQuestionsByChapter(chapterId, limit = 10) {
  const qs = DB.questions.filter(q => q.chapter === chapterId);
  if (qs.length === 0) {
    // fallback: return first N general questions
    return DB.questions.slice(0, limit);
  }
  return qs.slice(0, limit);
}

/* ---- Helper: get sub-skill questions ---- */
function getQuestionsBySubSkill(subSkillId, limit = 5) {
  const qs = DB.questions.filter(q => q.subSkill === subSkillId);
  if (qs.length === 0) return DB.questions.slice(0, limit);
  return qs.slice(0, limit);
}

/* ---- Helper: build the question set for a Full Length Test.
   If specific questions have been added by the admin to this test,
   those questions are loaded. Otherwise, the question pool is used. ---- */
function getFullLengthTestQuestions(test) {
  // 1. Check if test has specific assigned questions
  if (test && Array.isArray(test.questions) && test.questions.length > 0) {
    const resolved = test.questions.map((q) => {
      if (typeof q === 'object' && q !== null && q.text) return q;
      const qId = typeof q === 'object' ? q._id : q;
      const found = (DB.questions || []).find((dq) => dq.id === qId || dq._id === qId);
      return found || (typeof q === 'object' ? q : null);
    }).filter(Boolean);

    if (resolved.length > 0) {
      // If target numberOfQuestions is greater than assigned questions, cycle or return assigned
      const targetCount = test.numberOfQuestions || resolved.length;
      if (resolved.length >= targetCount) {
        return resolved.slice(0, targetCount);
      }
      return resolved;
    }
  }

  // 2. Fallback to pool if no specific questions are assigned
  const pool = DB.questions;
  if (pool.length === 0) return [];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const qs = [];
  const count = test.numberOfQuestions || 90;
  for (let i = 0; i < count; i++) {
    qs.push(shuffled[i % shuffled.length]);
  }
  return qs;
}

/* ---- Helper: read a Full Length Test's saved progress (attempts,
   best score, attempt history) from state. ---- */
function getFLTProgress(testId) {
  const state = State.get();
  return (state.fullLengthTests && state.fullLengthTests[testId]) || {
    attempts: 0,
    bestScore: 0,
    bestTotal: 0,
    attemptHistory: [],
  };
}

/* ---- Helper: record a completed Full Length Test attempt into state.
   Best score is only ever raised, never lowered by a later attempt. ---- */
function recordFLTAttempt(testId, results) {
  const state = State.get();
  if (!state.fullLengthTests) state.fullLengthTests = {};
  const prog = state.fullLengthTests[testId] || { attempts: 0, bestScore: 0, bestTotal: 0, attemptHistory: [] };

  const isCuet = testId === 'flt02' || (results && (results.examType === 'CUET' || (results.meta && results.meta.examType === 'CUET'))) || state.examMode === 'CUET';
  const examMode = isCuet ? 'CUET' : 'NEET';

  prog.attempts += 1;
  prog.examMode = examMode;
  prog.attemptHistory.push({
    attempt: prog.attempts,
    examMode,
    score: results.correct,
    total: results.totalQuestions,
    accuracy: results.accuracy,
    marks: results.score,
    maxMarks: isCuet ? 250 : 360,
    timeSpent: results.timeSpent,
    createdAt: new Date().toISOString(),
  });

  if (prog.attempts === 1 || results.correct > prog.bestScore) {
    prog.bestScore = results.correct;
    prog.bestTotal = results.totalQuestions;
  }

  state.fullLengthTests[testId] = prog;
  computeRealTimePerformance(state);
  State.save(state);
  return prog;
}

/* ---- Helper: record a completed test attempt into student's real-time performance ---- */
function recordChapterTestAttempt(results) {
  if (!results) return;
  const state = State.get();
  if (!state.performance) state.performance = {};
  const perf = state.performance;

  const isCuet = (results.meta && (results.meta.examType === 'CUET' || results.meta.mode === 'cuet')) || results.examType === 'CUET' || results.mode === 'cuet' || state.examMode === 'CUET';
  const examMode = isCuet ? 'CUET' : 'NEET';

  const qCount = results.totalQuestions || (results.questionResults ? results.questionResults.length : 0);
  const correctCount = results.correct || 0;
  const wrongCount = results.incorrect || 0;
  const unattemptedCount = results.unattempted || 0;
  const acc = results.accuracy !== undefined ? results.accuracy : (qCount > 0 ? Math.round((correctCount / qCount) * 100) : 0);
  const timeSpentSec = results.timeSpent || 45;
  const avgTimePerQ = Math.max(5, Math.round(timeSpentSec / Math.max(1, qCount)));
  const evaluatedMarks = isCuet ? (correctCount * 5 - wrongCount * 1) : (correctCount * 4 - wrongCount * 1);
  const maxMarks = isCuet ? Math.min(250, qCount * 5) : (qCount * 4);

  // Chapter Test History
  if (!perf.chapterTestHistory) perf.chapterTestHistory = [];
  const hist = perf.chapterTestHistory;
  const chapterName = (results.meta && (results.meta.chapterName || results.meta.title)) || (results.mode === 'ncert-focus' ? 'NCERT Bio Focus' : (isCuet ? 'CUET Practice Test' : 'Practice Test'));

  hist.push({
    label: `${isCuet ? 'CUET ' : ''}Test ${hist.length + 1}`,
    chapterName,
    examMode,
    score: correctCount,
    total: qCount,
    accuracy: acc,
    marks: evaluatedMarks,
    maxMarks: maxMarks,
    timeSpent: timeSpentSec,
    avgTimePerQuestion: avgTimePerQ,
    createdAt: new Date().toISOString(),
  });

  if (hist.length > 50) hist.shift();

  // Re-calculate all real-time stats cleanly for active exam mode
  computeRealTimePerformance(state);

  State.save(state);
  return hist;
}

/* ---- Helper: chronological Chapter-wise Test performance trend for
   the Performance page graph. Returns real recorded attempts filtered by mode. ---- */
function getChapterTestTrend(limit = 12) {
  const state = State.get();
  const isCuet = state.examMode === 'CUET';
  const real = (state.performance && state.performance.chapterTestHistory) || [];
  const filtered = real.filter(h => isCuet ? h.examMode === 'CUET' : h.examMode !== 'CUET');
  return filtered.slice(-limit);
}

/* ---- Helper: chronological Full-Length Test performance trend for
   the Performance page graph filtered by mode. ---- */
function getFullLengthTestTrend() {
  const state = State.get();
  const isCuet = state.examMode === 'CUET';
  const real = [];
  DB.fullLengthTests.forEach((t, i) => {
    const isTestCuet = t.id === 'flt02' || (t.title && t.title.toLowerCase().includes('cuet'));
    if (isCuet && !isTestCuet) return;
    if (!isCuet && isTestCuet) return;
    const prog = (state.fullLengthTests && state.fullLengthTests[t.id]) || null;
    if (prog && prog.attemptHistory && prog.attemptHistory.length > 0) {
      const latest = prog.attemptHistory[prog.attemptHistory.length - 1];
      real.push({
        label: isTestCuet ? `CUET Mock ${i + 1}` : `NEET FLT ${i + 1}`,
        title: t.title,
        score: latest.score,
        total: latest.total,
        accuracy: latest.accuracy,
      });
    }
  });
  return real;
}

function updateDailyStreak(state) {
  if (!state || !state.performance) return;
  const perf = state.performance;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (!perf.lastActiveDate) {
    perf.currentStreak = 1;
    perf.longestStreak = Math.max(perf.longestStreak || 1, 1);
    perf.lastActiveDate = todayStr;
    return;
  }

  if (perf.lastActiveDate === todayStr) {
    return;
  }

  const last = new Date(perf.lastActiveDate);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    perf.currentStreak = (perf.currentStreak || 0) + 1;
  } else if (diffDays > 1) {
    perf.currentStreak = 1;
  }
  perf.longestStreak = Math.max(perf.longestStreak || 1, perf.currentStreak);
  perf.lastActiveDate = todayStr;
}

/* ---- Real-Time Performance & Rank Computation Engine ----
   Computes actual stats dynamically from the student's real recorded history
   specifically according to the active exam mode (NEET vs CUET). ---- */
function computeRealTimePerformance(state) {
  if (!state) state = State.get();
  if (!state.performance) state.performance = State.defaultState().performance;
  const isCuet = (state.examMode === 'CUET');
  const perf = state.performance;

  // 1. Filter Chapter & Practice Test History based on active examMode
  const allChapterHistory = perf.chapterTestHistory || [];
  const modeChapterHistory = allChapterHistory.filter(h => {
    if (isCuet) {
      return h.examMode === 'CUET' || h.examType === 'CUET' || (h.chapterName && h.chapterName.includes('CUET'));
    } else {
      return h.examMode !== 'CUET' && h.examType !== 'CUET' && (!h.chapterName || !h.chapterName.includes('CUET'));
    }
  });

  let totalTests = modeChapterHistory.length;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalTimeSpent = 0;
  let totalMarksScored = 0;
  let maxPossibleMarks = 0;
  let hasPerfectScore = false;
  let hasSpeedDemon = false;

  modeChapterHistory.forEach(h => {
    const qCount = h.total || 0;
    const cCount = h.score || 0;
    const wCount = (h.incorrect !== undefined) ? h.incorrect : Math.max(0, qCount - cCount);
    const unCount = (h.unattempted !== undefined) ? h.unattempted : 0;
    
    totalQuestions += qCount;
    totalCorrect += cCount;
    totalIncorrect += wCount;
    totalUnattempted += unCount;
    
    const timeForTest = (h.timeSpent || (h.avgTimePerQuestion ? h.avgTimePerQuestion * qCount : 45 * qCount));
    totalTimeSpent += timeForTest;

    const testMarks = (h.marks !== undefined) 
      ? h.marks 
      : (isCuet ? (cCount * 5 - wCount * 1) : (cCount * 4 - wCount * 1));
    const testMaxMarks = (h.maxMarks !== undefined)
      ? h.maxMarks
      : (isCuet ? Math.min(250, qCount * 5) : (qCount * 4));
    
    totalMarksScored += testMarks;
    maxPossibleMarks += testMaxMarks;

    if (h.accuracy === 100 && qCount >= 5) hasPerfectScore = true;
    if (h.avgTimePerQuestion && h.avgTimePerQuestion < 40 && h.accuracy >= 80) hasSpeedDemon = true;
  });

  // 2. Aggregate from Full-Length Tests History based on active examMode
  if (state.fullLengthTests) {
    Object.entries(state.fullLengthTests).forEach(([testId, flt]) => {
      if (flt && Array.isArray(flt.attemptHistory)) {
        const isTestCuet = testId === 'flt02' || (flt.examMode === 'CUET') || (flt.examType === 'CUET');
        if (isCuet && !isTestCuet) return;
        if (!isCuet && isTestCuet) return;

        flt.attemptHistory.forEach(att => {
          totalTests += 1;
          const qCount = att.total || (isCuet ? 50 : 90);
          const cCount = att.score || 0;
          const wCount = Math.max(0, qCount - cCount);
          totalQuestions += qCount;
          totalCorrect += cCount;
          totalIncorrect += wCount;
          totalTimeSpent += (att.timeSpent || (45 * qCount));

          const fltMarks = (att.marks !== undefined)
            ? att.marks
            : (isCuet ? (cCount * 5 - wCount * 1) : (cCount * 4 - wCount * 1));
          const fltMaxMarks = isCuet ? 250 : 360;
          totalMarksScored += fltMarks;
          maxPossibleMarks += fltMaxMarks;

          if (att.accuracy === 100 && qCount >= 10) hasPerfectScore = true;
        });
      }
    });
  }

  // 3. Update Exact Aggregated Counters for active examMode
  perf.testsAttempted = totalTests;
  perf.questionsAttempted = totalQuestions;
  perf.correctAnswers = totalCorrect;
  perf.incorrectAnswers = totalIncorrect;
  perf.unattempted = totalUnattempted;
  perf.overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  perf.totalMarksScored = totalMarksScored;
  perf.maxPossibleMarks = maxPossibleMarks;
  perf.projectedScore = isCuet
    ? Math.round((perf.overallAccuracy / 100) * 250)
    : Math.round((perf.overallAccuracy / 100) * 360);

  // 4. Real-time Avg Speed Per Question (in seconds)
  const avgSpeed = totalQuestions > 0 ? Math.max(5, Math.round(totalTimeSpent / totalQuestions)) : null;
  perf.lastAvgTimePerQuestion = avgSpeed;

  // 5. Real-time Rank & Percentile Calculation (Criteria 1: Marks + Criteria 2: Speed)
  if (totalTests === 0) {
    perf.rank = null;
    perf.percentile = 0;
    perf.totalStudents = perf.totalStudents || 1;
    perf.longestStreak = perf.currentStreak || 1;
  } else {
    const activeStudentCount = perf.totalStudents || 1;
    perf.totalStudents = activeStudentCount;
    
    if (activeStudentCount <= 1) {
      perf.rank = 1;
      perf.percentile = 100;
    } else {
      let computedRank = 1;
      const speed = avgSpeed || 45;
      if (perf.overallAccuracy >= 95 && speed <= 45) {
        computedRank = 1;
      } else if (perf.overallAccuracy >= 90) {
        computedRank = Math.min(activeStudentCount, speed <= 50 ? 2 : 3);
      } else if (perf.overallAccuracy >= 80) {
        computedRank = Math.min(activeStudentCount, Math.ceil(activeStudentCount * 0.15));
      } else if (perf.overallAccuracy >= 70) {
        computedRank = Math.min(activeStudentCount, Math.ceil(activeStudentCount * 0.35));
      } else if (perf.overallAccuracy >= 50) {
        computedRank = Math.min(activeStudentCount, Math.ceil(activeStudentCount * 0.60));
      } else {
        computedRank = Math.min(activeStudentCount, Math.ceil(activeStudentCount * 0.85));
      }
      perf.rank = computedRank;
      perf.percentile = Math.max(1, Math.min(99.9, Math.round(((activeStudentCount - perf.rank + 1) / activeStudentCount) * 100 * 10) / 10));
    }
    perf.longestStreak = Math.max(perf.longestStreak || 1, perf.currentStreak || 1);
  }

  // 6. Real-time Badges Unlocking
  if (Array.isArray(perf.badges)) {
    perf.badges.forEach(b => {
      if (b.id === 'b01') b.earned = (perf.currentStreak >= 7 || perf.longestStreak >= 7);
      if (b.id === 'b02') b.earned = (totalTests >= 1);
      if (b.id === 'b03') b.earned = hasPerfectScore;
      if (b.id === 'b04') b.earned = (perf.percentile >= 99 && totalTests >= 3);
      if (b.id === 'b05') b.earned = hasSpeedDemon;
      if (b.id === 'b06') b.earned = (totalTests >= 5);
    });
  }

  // 7. Real-time Weekly Accuracy Trend Array (7 Data points for active mode)
  const weeklyData = [];
  if (modeChapterHistory.length > 0) {
    const recent = modeChapterHistory.slice(-7);
    recent.forEach(h => weeklyData.push(h.accuracy || 0));
    while (weeklyData.length < 7) {
      weeklyData.unshift(0);
    }
  } else {
    weeklyData.push(0, 0, 0, 0, 0, 0, 0);
  }
  perf.weeklyProgress = weeklyData;

  return perf;
}

/* ---- LocalStorage State ---- */
const State = {
  KEY: 'bioready_v1',

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const state = raw ? JSON.parse(raw) : this.defaultState();
      if (!state.examMode) state.examMode = 'NEET';
      if (!state.spacedReviewPool) state.spacedReviewPool = [];
      if (!state.masteredPool) state.masteredPool = [];
      if (!state.fullLengthTests) state.fullLengthTests = {};
      if (!state.mistakeReasons) state.mistakeReasons = {};
      if (!state.performance) state.performance = this.defaultState().performance;
      if (!state.performance.chapterTestHistory) state.performance.chapterTestHistory = [];

      // Auto-sanitize legacy mock values (e.g. old mock seeds from previous sessions)
      if (state.performance) {
        if (!state.performance.testsAttempted || state.performance.testsAttempted === 0) {
          state.performance.rank = null;
          state.performance.percentile = 0;
          state.performance.totalStudents = 1;
          state.performance.currentStreak = state.performance.currentStreak || 0;
          state.performance.longestStreak = state.performance.currentStreak || 0;
          state.performance.chapterProgress = state.performance.chapterProgress || {};
          state.performance.chapterTestHistory = [];
          state.weaknessMap = [];
          state.spacedRetests = [];
          // Purge legacy seed pool if tests have never been attempted
          if (Array.isArray(state.spacedReviewPool) && state.spacedReviewPool.length > 0 && !state.lastTestResult) {
            state.spacedReviewPool = [];
          }
        } else {
          // If in local/single testing mode, calculate clean live rank
          if (!window._liveTotalStudents && (state.performance.totalStudents >= 10 || state.performance.rank > 10)) {
            state.performance.totalStudents = 1;
            state.performance.rank = 1;
            state.performance.percentile = 100;
          }
        }
      }

      updateDailyStreak(state);
      computeRealTimePerformance(state);
      return state;
    } catch {
      return this.defaultState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch {
      console.warn('Could not save to localStorage');
    }
  },

  update(patch) {
    const state = this.get();
    const next = Object.assign({}, state, patch);
    this.save(next);
    return next;
  },

  getExamMode() {
    const state = this.get();
    return state.examMode || 'NEET';
  },

  setExamMode(mode) {
    const valid = mode === 'CUET' ? 'CUET' : 'NEET';
    this.update({ examMode: valid });
    document.dispatchEvent(new CustomEvent('biorank:exam-change', { detail: { examMode: valid } }));
    return valid;
  },

  defaultState() {
    return {
      configured: false,
      foundationDone: false,
      examMode: 'NEET', // 'NEET' | 'CUET'
      student: {
        name: '',
        classLevel: '12th',
        targetYear: '2025',
        board: 'CBSE',
        studyHoursPerDay: '4',
        confidence: 'Intermediate',
      },
      performance: {
        overallAccuracy: 0,
        testsAttempted: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unattempted: 0,
        currentStreak: 1,
        longestStreak: 1,
        rank: null,
        totalStudents: 1,
        percentile: 0,
        weeklyProgress: [0],
        badges: [
          { id: 'b01', name: '7-Day Streak',   icon: '🔥', earned: false },
          { id: 'b02', name: 'First Test',     icon: '⭐', earned: false },
          { id: 'b03', name: 'Perfect Score',  icon: '💯', earned: false },
          { id: 'b04', name: 'Top 1%',         icon: '🏆', earned: false },
          { id: 'b05', name: 'Speed Demon',    icon: '⚡', earned: false },
          { id: 'b06', name: 'Consistent',     icon: '📈', earned: false },
        ],
        chapterProgress: {},
        chapterTestHistory: [],
      },
      weaknessMap: [],
      spacedRetests: [],
      spacedReviewPool: [],
      masteredPool: [],
      fullLengthTests: {},
      ncertProgress: {},
      mistakeReasons: {},
      lastTestResult: null,
      lastWeaknessAnalysis: null,
      currentScreen: 'config',
    };
  },

  reset() {
    localStorage.removeItem(this.KEY);
    return this.defaultState();
  }
};

/* ---- Save pristine base copies for non-destructive syncing ---- */
DB.rawBaseChapters = JSON.parse(JSON.stringify(DB.chapters));
DB.rawBaseSubSkills = JSON.parse(JSON.stringify(DB.subSkills));
DB.rawBaseQuestions = JSON.parse(JSON.stringify(DB.questions));
DB.rawBaseFullLengthTests = JSON.parse(JSON.stringify(DB.fullLengthTests));
DB.rawBaseNcertQuestions = Array.isArray(DB.ncertQuestions) ? JSON.parse(JSON.stringify(DB.ncertQuestions)) : [];
DB.rawBaseCuetQuestions = Array.isArray(DB.cuetQuestions) ? JSON.parse(JSON.stringify(DB.cuetQuestions)) : [];

/* ---- Helper: get NEET PYQ Questions strictly (NEET only) ---- */
DB.getNeetPyqQuestions = function(filter = {}) {
  let list = (DB.questions || []).filter(q => q.examType !== 'CUET' && !q.isCuet);
  if (filter.year && filter.year !== 'all') {
    list = list.filter(q => String(q.year) === String(filter.year));
  }
  if (filter.chapterId && filter.chapterId !== 'all') {
    list = list.filter(q => q.chapter === filter.chapterId || q.chapterId === filter.chapterId);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(q => (q.text && q.text.toLowerCase().includes(s)) || (q.explanation && q.explanation.toLowerCase().includes(s)));
  }
  return list;
};

/* ---- Helper: get CUET PYQ Questions strictly (CUET Class 12 only) ---- */
DB.getCuetPyqQuestions = function(filter = {}) {
  let list = (DB.cuetQuestions || []).filter(q => q.examType === 'CUET' || q.isPyq);
  if (filter.year && filter.year !== 'all') {
    list = list.filter(q => String(q.year) === String(filter.year));
  }
  if (filter.chapterId && filter.chapterId !== 'all') {
    list = list.filter(q => q.chapter === filter.chapterId || q.chapterId === filter.chapterId);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(q => (q.text && q.text.toLowerCase().includes(s)) || (q.explanation && q.explanation.toLowerCase().includes(s)) || (q.caseStudyPassage && q.caseStudyPassage.toLowerCase().includes(s)));
  }
  return list;
};

/* ---- Sync DB with in-browser Admin Mock Store if available ---- */
DB.syncFromAdminStore = function() {
  try {
    localStorage.removeItem('biorank_admin_mock_v1');
    const raw = localStorage.getItem('biorank_admin_mock_v2');
    if (!raw) return;
    const mockData = JSON.parse(raw);
    if (!mockData) return;

    // 1. CHAPTERS
    if (Array.isArray(mockData.chapters)) {
      const chapterMap = new Map();
      (DB.rawBaseChapters || []).forEach(c => {
        chapterMap.set(c.id, { ...c });
      });
      mockData.chapters.forEach(c => {
        const id = c._id || c.id;
        if (c.active === false || c.isDeleted === true) {
          chapterMap.delete(id);
        } else {
          chapterMap.set(id, {
            id,
            name: c.name,
            icon: c.icon || '📘',
            questions: c.questionCount ?? c.questions ?? 0,
            class: String(c.class || '11'),
            weightage: Number(c.weightage) || 5,
          });
        }
      });
      DB.chapters = Array.from(chapterMap.values());
    }

    // 2. SUB-SKILLS
    if (Array.isArray(mockData.subSkills)) {
      const subSkillMap = new Map();
      (DB.rawBaseSubSkills || []).forEach(s => {
        subSkillMap.set(s.id, { ...s });
      });
      mockData.subSkills.forEach(s => {
        const id = s._id || s.id;
        if (s.active === false || s.isDeleted === true) {
          subSkillMap.delete(id);
        } else {
          subSkillMap.set(id, {
            id,
            name: s.name,
            chapter: s.chapterId || s.chapter,
            bloomLevel: s.bloomLevel || 'understand',
          });
        }
      });
      DB.subSkills = Array.from(subSkillMap.values());
    }

    // 3. QUESTIONS
    if (Array.isArray(mockData.questions)) {
      const qMap = new Map();
      (DB.rawBaseQuestions || []).forEach(q => {
        qMap.set(q.id, { ...q });
      });
      mockData.questions.forEach(q => {
        const id = q._id || q.id;
        if (q.active === false || q.isDeleted === true) {
          qMap.delete(id);
        } else {
          qMap.set(id, {
            id,
            chapter: q.chapterId || q.chapter,
            subSkill: q.subSkillId || q.subSkill,
            bloomLevel: q.bloomLevel || 'remember',
            weightage: Number(q.weightage) || 4,
            year: q.year || 2024,
            text: q.text || '',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Number(q.correctOption ?? q.correct ?? 0),
            correctOption: Number(q.correctOption ?? q.correct ?? 0),
            explanation: q.explanation || '',
            isFoundation: !!q.isFoundation,
          });
        }
      });
      DB.questions = Array.from(qMap.values());
    }

    // 4. FULL LENGTH TESTS
    if (Array.isArray(mockData.fullLengthTests)) {
      const fltMap = new Map();
      (DB.rawBaseFullLengthTests || []).forEach(t => {
        fltMap.set(t.id, { ...t });
      });
      mockData.fullLengthTests.forEach(t => {
        const id = t._id || t.id;
        const isCuet = t.examType === 'CUET' || (t.title && t.title.toLowerCase().includes('cuet'));
        if (t.active === false || t.isDeleted === true) {
          fltMap.delete(id);
        } else {
          fltMap.set(id, {
            id,
            title: t.title,
            examType: isCuet ? 'CUET' : 'NEET',
            markingScheme: isCuet ? { correct: 5, incorrect: -1, maxMarks: 250 } : { correct: 4, incorrect: -1, maxMarks: 360 },
            description: t.description || (isCuet ? 'Class 12 CUET Pattern Mock Test' : 'Complete Biology Mock Test'),
            numberOfQuestions: t.numberOfQuestions || (isCuet ? 50 : 90),
            durationMinutes: t.durationMinutes || (isCuet ? 60 : 90),
            questions: Array.isArray(t.questions) ? t.questions : [],
          });
        }
      });
      DB.fullLengthTests = Array.from(fltMap.values());
    }

    // 5. NCERT QUESTIONS
    if (Array.isArray(mockData.ncertQuestions)) {
      const ncertMap = new Map();
      (DB.rawBaseNcertQuestions || []).forEach(q => {
        ncertMap.set(q.id, { ...q });
      });
      mockData.ncertQuestions.forEach(q => {
        const id = q._id || q.id;
        if (q.active === false || q.isDeleted === true) {
          ncertMap.delete(id);
        } else {
          ncertMap.set(id, {
            id,
            chapterId: q.chapterId || q.chapter,
            subSkillId: q.subSkillId || q.subSkill,
            type: q.type || 'mcq',
            difficulty: q.difficulty || 'medium',
            text: q.text || '',
            assertion: q.assertion || '',
            reason: q.reason || '',
            columnA: q.columnA || [],
            columnB: q.columnB || [],
            diagramUrl: q.diagramUrl || '',
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
            correct: Number(q.correctOption ?? q.correct ?? 0),
            correctOption: Number(q.correctOption ?? q.correct ?? 0),
            explanation: q.explanation || '',
            ncertReference: q.ncertReference || '',
            isNcertFocus: true,
          });
        }
      });
      DB.ncertQuestions = Array.from(ncertMap.values());
    }

    // 6. CUET PYQ QUESTIONS
    if (Array.isArray(mockData.cuetQuestions)) {
      const cuetMap = new Map();
      (DB.rawBaseCuetQuestions || []).forEach(q => {
        cuetMap.set(q.id, { ...q });
      });
      mockData.cuetQuestions.forEach(q => {
        const id = q._id || q.id;
        if (q.active === false || q.isDeleted === true) {
          cuetMap.delete(id);
        } else {
          cuetMap.set(id, {
            id,
            chapter: q.chapterId || q.chapter,
            subSkill: q.subSkillId || q.subSkill,
            year: Number(q.year) || 2024,
            shift: q.shift || 'Official Slot',
            examType: 'CUET',
            isPyq: true,
            questionType: q.questionType || q.type || 'mcq',
            caseStudyPassage: q.caseStudyPassage || '',
            text: q.text || '',
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
            correct: Number(q.correctOption ?? q.correct ?? 0),
            correctOption: Number(q.correctOption ?? q.correct ?? 0),
            explanation: q.explanation || '',
            ncertReference: q.ncertReference || '',
          });
        }
      });
      DB.cuetQuestions = Array.from(cuetMap.values());
    }

    // 7. NEET PYQ QUESTIONS
    if (Array.isArray(mockData.neetPyqs)) {
      const qMap = new Map();
      (DB.questions || []).forEach(q => qMap.set(q.id, q));
      mockData.neetPyqs.forEach(q => {
        const id = q._id || q.id;
        if (q.active === false || q.isDeleted === true) {
          qMap.delete(id);
        } else {
          qMap.set(id, {
            id,
            chapter: q.chapterId || q.chapter,
            subSkill: q.subSkillId || q.subSkill,
            year: Number(q.year) || 2024,
            shift: q.shift || 'Official NEET',
            examType: 'NEET',
            isPyq: true,
            questionType: q.questionType || q.type || 'mcq',
            diagramUrl: q.diagramUrl || '',
            text: q.text || '',
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
            correct: Number(q.correctOption ?? q.correct ?? 0),
            correctOption: Number(q.correctOption ?? q.correct ?? 0),
            explanation: q.explanation || '',
            ncertReference: q.ncertReference || '',
            isFoundation: !!q.isFoundation,
          });
        }
      });
      DB.questions = Array.from(qMap.values());
    }
  } catch (e) {
    console.warn('Could not sync DB from storage', e);
  }
};

window.State = State;
window.DB = DB;
window.getFLTProgress = getFLTProgress;
window.recordFLTAttempt = recordFLTAttempt;
window.getFullLengthTestQuestions = getFullLengthTestQuestions;

// Initial sync on load
DB.syncFromAdminStore();
window.addEventListener('storage', (e) => {
  if (e.key === 'biorank_admin_mock_v2') {
    DB.syncFromAdminStore();
  }
});
