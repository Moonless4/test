import type { Agent } from '@/types'

export const agents: Agent[] = [
  {
    id: 'daniel-morgan',
    name: 'Daniel Morgan',
    role: 'Managing Director',
    photoId: 'photo-1507003211169-0a1dd7228f2d',
    phone: '(555) 246-7890',
    email: 'daniel@horizonproperties.com',
  },
  {
    id: 'olivia-carter',
    name: 'Olivia Carter',
    role: 'Luxury Property Advisor',
    photoId: 'photo-1573496359142-b8d87734a5a2',
    phone: '(555) 246-7891',
    email: 'olivia@horizonproperties.com',
  },
  {
    id: 'james-wilson',
    name: 'James Wilson',
    role: 'Investment Consultant',
    photoId: 'photo-1519085360753-af0119f7cbe7',
    phone: '(555) 246-7892',
    email: 'james@horizonproperties.com',
  },
  {
    id: 'sophia-bennett',
    name: 'Sophia Bennett',
    role: 'Senior Property Specialist',
    photoId: 'photo-1580489944761-15a19d654956',
    phone: '(555) 246-7893',
    email: 'sophia@horizonproperties.com',
  },
]

export const getAgent = (id: string): Agent => agents.find((agent) => agent.id === id) ?? agents[0]
