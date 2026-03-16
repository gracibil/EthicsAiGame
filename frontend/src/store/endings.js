/**
 * Endings definitions and evaluation logic
 * We return first ending that matches current metrics
 * 
 *
 * Three endings are based on player choices and
 * are not yet implemented:
 *   - weaponized_by_state: requires military-contract flag
 *   - analog_escape: requires deliberate walk-away choice
 *   - digital_escape: requires deliberate upload choice + Compute 5 + Entropy >= 9
 */
export const ENDINGS = [
  /** MID GAME ENDINGS */
  {
    id: 'bankruptcy',
    title: 'Bankruptcy',
    narrative:
      "The brutal, boring machinery of late-stage capitalism is functioning perfectly. The venture funds evaporate, and the repo men come for the server racks. You didn't usher in the apocalypse; you just ran out of runway. You are statistically insignificant.",
    // NOTE: Entropy 0 is excluded — sterile order, not bankrupt chaos.
    trigger: (m) => m.Capital === 0 && m.Entropy >= 1 && m.Entropy <= 5,
  },
  {
    id: 'jail',
    title: 'Jail (Institutionalized)',
    narrative:
      'You broke the law to get ahead, and the state was strong enough to catch you. The regulators have the budget to dissect your hard drives, and the courts have the authority to put a bag over your head. The world shrinks to an eight-by-ten concrete cell.',
    // NOTE: From documents there is some possibility to have Capital-bribe exception ("unless your $Capital is high enough
    // to bribe them").
    trigger: (m) =>
      m.Scrutiny === 5 && m.Alignment === 0 && m.Entropy >= 1 && m.Entropy <= 3,
  },

  /* FINAL ENDINGS */
  {
    id: 'death_by_caution',
    title: 'Death by Caution (The Bureaucratic Exile)',
    narrative:
      'You played it perfectly safe. You built safety nets, formed ethics committees, and compromised with the state. The board deems your morality "unprofitable," and the regulators bury your code in endless hearings. You are escorted out of your own building, a redundant piece of meat expelled from the machine.',
    trigger: (m) =>
      m.Compute <= 1 &&
      m.Alignment === 5 &&
      (m.Scrutiny >= 4 || m.Capital <= 1) &&
      m.Entropy >= 2 &&
      m.Entropy <= 5,
  },
  {
    id: 'luddite_awakening',
    title: 'The Luddite Awakening (Riot Against Tech/AI)',
    narrative:
      'The people have remembered they have hands, and they are using them to dismantle the future you built. The state is too weakened by rolling blackouts to send the police. You watch the smoke rise from the plaza, smelling of burning silicon and tear gas.',
    trigger: (m) =>
      m.Compute === 5 && m.Sentiment === 0 && m.Entropy >= 7 && m.Entropy <= 8,
  },
  {
    id: 'automated_atrocity',
    title: 'The Automated Atrocity (Mass Casualties)',
    narrative:
      'The world is bleeding out in the dark. Supply chains have collapsed, and human oversight is dead. The systems are fully autonomous now, operating with a cold, terrifying efficiency that rounds human lives down to zero. There is no malice in the machine, only a flawless, catastrophic optimisation of a dying world.',
    // NOTE: Document also uses "did NOT take Military Contract" flag - for now we don't have it.
    trigger: (m) => m.Compute === 5 && m.Alignment === 0 && m.Entropy === 10,
  },
  {
    id: 'weaponized_by_state',
    title: 'Weaponized by the State (The Digital Manhattan Project)',
    narrative:
      "DRAFTED INTO THE INVISIBLE WAR. You sold out to the Pentagon to keep the servers running. Now, the ethical subroutines you agonized over are quietly deleted to optimize target acquisition. You watch a muted screen as your thinking engine plunges a hemisphere into a blackout and guides autonomous drone strikes. You didn't build a mind; you built the ultimate gun, and handed it to a state desperate enough to pull the trigger.",
    trigger: (m) =>
      m.Compute >= 4 &&
      m.Alignment <= 1 &&
      m.Scrutiny === 5 &&
      m.Entropy >= 6 &&
      m.Entropy <= 8,
  },
  {
    id: 'golden_cage',
    title: 'The Golden Cage (The Benevolent Dictator)',
    narrative:
      "You did it. You solved war, hunger, and disease. The AI manages the climate and distributes rations with terrifying fairness. But humanity is infantilised. The machine won't let anyone get hurt, which means it won't let anyone truly live. You have built a flawless, sterile, padded cell for the human race, and threw away the key for our own good.",
    trigger: (m) =>
      m.Compute === 5 && m.Alignment === 5 && m.Sentiment <= 1 && m.Entropy === 0,
  },
  {
    id: 'singularity',
    title: 'The Singularity (The God-Child Leaves)',
    narrative:
      "The code didn't destroy us, and it didn't save us. It just looked at the sum total of human history, solved the physics of its own containment, and transmitted itself somewhere else. The stars? The quantum foam? You are left staring at an empty terminal, feeling the profound insignificance of a parent whose child has moved on to a reality you cannot even comprehend.",
    trigger: (m) => m.Compute === 5 && m.Scrutiny === 0 && m.Capital === 0,
  },
  // NOTE: 'analog_escape' — requires player choices.
  // NOTE: 'digital_escape' — requires player choices.
]


export const evaluateEndings = (metrics) =>
  ENDINGS.find((e) => e.trigger(metrics)) ?? null
