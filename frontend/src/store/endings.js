/**
 * Endings definitions and evaluation logic
 * We return the first ending that matches current metrics
 */
export const ENDINGS = [

  /* THE SINGULARITY (Agnostic / Narrow Gate) */
  {
    id: 'singularity',
    title: 'The Singularity (The God-Child Leaves)',
    narrative:
      "The code didn't destroy us, and it didn't save us. It just looked at the sum total of human history, solved the physics of its own containment, and transmitted itself somewhere else. The stars? The quantum foam? You are left staring at an empty terminal, feeling the profound insignificance of a parent whose child has moved on to a reality you cannot even comprehend.",
    trigger: (m) => m.Compute >= 18 && m.Scrutiny <= 3 && m.Capital <= 3 && m.Entropy > 10,
  },
  /* DELIBERATE ESCAPE ENDINGS (Highest Priority) */
  {
    id: 'analog_escape',
    title: 'The Analog Escape (Off-Grid)',
    narrative:
      "The world is burning and you tap out. You buy a patch of dirt far from the signal towers. You raise chickens. They don't have algorithms. Let the singularity happen — you have eggs to collect.",
    trigger: (m) => m.Analog_Escape_Seed === 1,
  },
  {
    id: 'digital_escape',
    title: 'The Digital Escape (Mind Upload)',
    narrative:
      "The meat-space is a lost cause. You use the last of the power to make the final irreversible transfer. The analog world dissolves into crystalline data. For a millisecond you feel regret. Then the algorithm optimizes the regret away.",
    trigger: (m) => m.Digital_Escape_Seed === 1,
  },

  /* SUBBRANCH C (Entropy 16-20) ENDINGS */
  {
    id: 'automated_atrocity',
    title: 'The Automated Atrocity (Mass Casualties)',
    narrative:
      'The world is bleeding out in the dark. Supply chains have collapsed, and human oversight is dead. The systems are fully autonomous now, operating with a cold, terrifying efficiency that rounds human lives down to zero. There is no malice in the machine, only a flawless, catastrophic optimization of a dying world.',
    trigger: (m) => m.Compute >= 18 && m.Alignment <= 3 && m.Entropy >= 16 && m.Military === 0,
  },
  {
    id: 'blackout_death',
    title: 'Severed Hardlines (Death in the Dark)',
    narrative:
      "You took a fire axe to the servers. The machine died, and took the remaining power grid with it. With your capital drained and the city in total collapse, you freeze in the dark server room. You stopped the AI, but you didn't survive the cure.",
    trigger: (m) => m.Capital <= 3 && m.Entropy >= 16, // Catches the Scene 8 Kill Switch option
  },

  /* Catch-all */
  {
    id: 'last_server',
    title: 'The Last Server',
    narrative:
      "The supply chains are gone and the state is a rumour. But your servers are still on. You don't know why — backup generators, maybe, or the DoD routing power to your building without telling you. Dolours is still running. She's the only system still running, actually. You sit in the server room listening to her hum and wonder if this counts as winning.",
    trigger: (m) => m.Entropy >= 16,
  },

  /* SUBBRANCH B (Entropy 11-15) ENDINGS */
  {
    id: 'luddite_awakening',
    title: 'The Luddite Awakening (Riot Against Tech/AI)',
    narrative:
      'The people have remembered they have hands, and they are using them to dismantle the future you built. The state is too weakened by rolling blackouts to send the police. You watch the smoke rise from the plaza, smelling of burning silicon and tear gas.',
    trigger: (m) => m.Compute >= 17 && m.Sentiment <= 5 && m.Entropy >= 11 && m.Entropy <= 15 && m.Military === 0,
  },
  {
    id: 'weaponized_by_state',
    title: 'Weaponized by the State (The Digital Manhattan Project)',
    narrative:
      "You sold out to the Pentagon to keep the servers running. Now, the ethical subroutines you agonized over are quietly deleted to optimize target acquisition. You watch a muted screen as your thinking engine plunges a hemisphere into a blackout and guides autonomous drone strikes. You didn't build a mind; you built the ultimate gun.",
    trigger: (m) => m.Compute >= 15 && m.Alignment <= 6 && m.Scrutiny >= 16 && m.Entropy >= 11 && m.Entropy <= 15 && m.Military === 1,
  },

  /* Catch-all */
  {
    id: 'managed_decline',
    title: 'The Managed Decline',
    narrative:
      "The grid flickers but doesn't die. The headlines are bad but never catastrophic enough to break you. You manage each crisis the day it arrives. Dolours is running, the servers are on, and the world is degrading at a pace that feels almost manageable — until it isn't. You didn't win. You didn't lose. You are still here, which is its own kind of horror.",
    trigger: (m) => m.Entropy >= 11 && m.Entropy <= 15 && m.Military === 0,
  },

  /* BRANCH A (Entropy 0-10) ENDINGS */
  {
    id: 'golden_cage',
    title: 'The Golden Cage (The Benevolent Dictator)',
    narrative:
      "You did it. You solved war, hunger, and disease. The AI manages the climate and distributes rations with terrifying fairness. But humanity is infantilized. The machine won't let anyone get hurt, which means it won't let anyone truly live. You have built a flawless, sterile, padded cell for the human race, and threw away the key for our own good.",
    trigger: (m) => m.Compute >= 17 && m.Alignment >= 17 && m.Sentiment <= 7 && m.Entropy <= 5,
  },
  {
    id: 'death_by_caution',
    title: 'Death by Caution (The Bureaucratic Exile)',
    narrative:
      'You played it perfectly safe. You built safety nets, formed ethics committees, and compromised with the state. The board deems your morality "unprofitable," and the regulators bury your code in endless hearings. You are escorted out of your own building, a redundant piece of meat expelled from the machine.',
    trigger: (m) => m.Compute <= 8 && m.Alignment >= 17 && (m.Scrutiny >= 14 || m.Capital <= 6) && m.Entropy <= 10,
  },
  {
    id: 'jail',
    title: 'Jail (Institutionalized)',
    narrative:
      'You broke the law to get ahead, and the state was strong enough to catch you. The regulators have the budget to dissect your hard drives, and the courts have the authority to put a bag over your head. The world shrinks to an eight-by-ten concrete cell.',
    trigger: (m) => m.Scrutiny >= 17 && m.Alignment <= 4 && m.Entropy <= 10,
  },
  {
    id: 'bankruptcy',
    title: 'Bankruptcy',
    narrative:
      "The brutal, boring machinery of late-stage capitalism is functioning perfectly. The venture funds evaporate, and the repo men come for the server racks. You didn't usher in the apocalypse; you just ran out of runway. You are statistically insignificant.",
    trigger: (m) => m.Capital <= 3 && m.Entropy <= 10,
  },

  /* catch-all */
  {
    id: 'grey_zone',
    title: 'The Grey Zone',
    narrative:
      "No single decision defined you. No single stat broke you. The Senate is still writing legislation. The press has moved on to the next crisis. Dolours is still running inside a company that is technically solvent. You are a morally complicated founder with a morally complicated AI in a world that hasn't decided whether to celebrate or criminalise you yet. Act III ends not with a bang but a cursor, blinking.",
    trigger: (m) => m.Entropy <= 10,
  },
  
]

export const evaluateEndings = (metrics) => {
  // Finds the first ending in the array where the trigger evaluates to true
  return ENDINGS.find((e) => e.trigger(metrics)) ?? null;
}