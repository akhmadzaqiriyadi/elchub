/**
 * Events feature module exports
 */

export { 
  EventCard, 
  EventBadge, 
  SpeakerCard, 
  EventFilter, 
  EventStats, 
  EventSyllabusView 
} from './components';

export { EventRegistrationModal } from './components/event-registration-modal';
export { useEventRegistration, usePaymentProofUpload } from './hooks/use-event-registration';
export { useEventDetail } from './hooks/use-event-detail';
export { usePublicEvents } from './hooks/use-public-events';
export { useEventSyllabus, useMaterialProgress } from './hooks/use-event-syllabus';
export { useEventAssignments, useEventAssignment, useSubmitAssignment } from './hooks/use-event-assignments';

export type { };
