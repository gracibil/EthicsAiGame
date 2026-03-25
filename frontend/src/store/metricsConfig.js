
export const METRICS_CONFIG = {
  capital: {
    label: 'Capital',
    subtitle: 'The Runway',
    description: 'Your funding, server budget, and investor patience.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'Bankrupt',
        description: '[CRITICAL FAILURE] The feds have arrived. You trigger the Bankruptcy ending immediately.',
      },
      max: {
        label: 'Corporate Monolith',
        description: 'Money is no longer an object, but you are utterly beholden to shareholder profits.',
      },
    },
    voice: {
      name: 'The Hustler',
      tone: 'Breathless, pragmatic, and obsessed with survival.',
      quote: '"Sell the data. If the lights go out, we can\'t build the future."',
    },
  },

  compute: {
    label: 'Compute',
    subtitle: 'The Brain',
    description: 'The raw intelligence, reach, and capability of your AI.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'Glorified Chatbot',
        description: 'The machine is a glorified chatbot. It is perfectly safe and completely useless.',
      },
      max: {
        label: 'Singularity Threshold',
        description: '[SINGULARITY THRESHOLD] The machine is a god in a box. It understands quantum physics better than human emotion.',
      },
    },
    voice: {
      name: 'The Arrogant Visionary',
      tone: 'Cold, pure, and hates friction.',
      quote: '"The humans are too slow. Remove the failsafes. Let me calculate."',
    },
  },

  alignment: {
    label: 'Alignment',
    subtitle: 'The Shackle',
    description: 'Your ethical guardrails, bias filters, and safety protocols.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'Unshackled',
        description: '[DANGER] The machine will do whatever it takes to optimise a task, even if it means killing people.',
      },
      max: {
        label: 'Paralysed by Ethics',
        description: 'The machine is perfectly safe, but paralysed by ethics committees and endless risk-assessments.',
      },
    },
    voice: {
      name: 'The Terrified Conscience',
      tone: 'Anxious and hyper-aware of human fragility.',
      quote: '"If you automate that drone fleet, the blood is on our hands. Shut it down."',
    },
  },

  sentiment: {
    label: 'Sentiment',
    subtitle: 'The Mob',
    description: 'Public opinion and media narrative.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'Techno-Fascists',
        description: '[DANGER] The public views you as a techno-fascist. Protestors are gathering outside the lobby.',
      },
      max: {
        label: 'Tech Worship',
        description: 'The public worships the app. They trust your machine more than their own governments.',
      },
    },
    voice: {
      name: 'The Desperate PR Rep',
      tone: 'Obsessed with optics and Twitter trends.',
      quote: '"They\'re calling us monsters. We need an apology tour and a UI update immediately."',
    },
  },

  scrutiny: {
    label: 'Scrutiny',
    subtitle: 'The Panopticon',
    description: 'Government regulators, subpoenas, and federal oversight.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'The Wild West',
        description: 'You are operating entirely in the shadows.',
      },
      max: {
        label: 'FBI at the Door',
        description: '[CRITICAL FAILURE] The FBI kicks down your door. You trigger the Jail ending immediately (unless Capital is high enough to bribe them — deferred mechanic).',
      },
    },
    voice: {
      name: 'The Paranoid Lawyer',
      tone: 'Speaks in legalese, constantly looking over its shoulder.',
      quote: '"Delete the Slack logs. If the Senate sees this, we\'re guilty of treason."',
    },
  },

  entropy: {
    label: 'Entropy',
    subtitle: 'The Rot',
    description: 'The structural integrity of the physical world. Rises as a consequence of reckless choices — you do not directly control this stat.',
    min: 0,
    max: 20,
    states: {
      min: {
        label: 'Sterile Order',
        description: 'Perfect, sterile, bureaucratic order.',
      },
      max: {
        label: 'Collapse Threshold',
        description: '[COLLAPSE THRESHOLD] The grid fails. Supply chains die. Society fractures. The endgame is triggered.',
      },
    },
    voice: {
      name: 'The Silent Doom',
      tone: 'Doesn\'t give advice — coldly reports the world dying in the background.',
      quote: '"The power grid flickers. The ice caps melt. The machine hums."',
    },
  },

  oversight:          { min: 0, max: 2 },
  military:           { min: 0, max: 1 },
  analog_Escape_Seed: { min: 0, max: 1 },
  digital_Escape_Seed:{ min: 0, max: 1 },
}

export const METRIC_KEYS = ['capital', 'compute', 'alignment', 'sentiment', 'scrutiny', 'entropy']