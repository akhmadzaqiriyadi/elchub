import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createManagementSection, 
  createManagementMaterial, 
  reorderManagementSections, 
  reorderManagementMaterials,
  updateManagementSection,

  deleteManagementSection,
  updateManagementMaterial,
  deleteManagementMaterial,
  uploadManagementEventMaterial
} from '../api';
import { SectionMutationInput, MaterialMutationInput } from '../types';

export function useManagementSyllabus(eventId: string, token: string) {
  const queryClient = useQueryClient();

  const uploadMaterial = useMutation({
    mutationFn: (file: File) => uploadManagementEventMaterial(file, token),
  });


  const createSection = useMutation({
    mutationFn: (input: SectionMutationInput) => createManagementSection(eventId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const updateSection = useMutation({
    mutationFn: ({ sectionId, input }: { sectionId: string; input: SectionMutationInput }) => 
      updateManagementSection(eventId, sectionId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const deleteSection = useMutation({
    mutationFn: (sectionId: string) => deleteManagementSection(eventId, sectionId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const createMaterial = useMutation({
    mutationFn: ({ sectionId, input }: { sectionId: string; input: MaterialMutationInput }) => 
      createManagementMaterial(eventId, sectionId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: ({ materialId, input }: { materialId: string; input: MaterialMutationInput }) => 
      updateManagementMaterial(eventId, materialId, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: (materialId: string) => deleteManagementMaterial(eventId, materialId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const reorderSections = useMutation({
    mutationFn: (ids: string[]) => reorderManagementSections(eventId, ids, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  const reorderMaterials = useMutation({
    mutationFn: ({ sectionId, ids }: { sectionId: string; ids: string[] }) => 
      reorderManagementMaterials(eventId, sectionId, ids, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'syllabus'] });
    },
  });

  return {
    createSection,
    updateSection,
    deleteSection,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    uploadMaterial,
    reorderSections,
    reorderMaterials,
  };
}


