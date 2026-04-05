export const FLOW_STEPS = [
  { id: 'welcome', number: '01', title: 'Welcome' },
  { id: 'system', number: '02', title: 'System' },
  { id: 'docker', number: '03', title: 'Docker' },
  { id: 'daemon', number: '04', title: 'Daemon' },
  { id: 'release', number: '05', title: 'Release' },
];

export function getStepIndex(stepId) {
  const index = FLOW_STEPS.findIndex((step) => step.id === stepId);
  return index < 0 ? 0 : index;
}