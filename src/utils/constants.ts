import { Subject } from '../types';

export const CLASS_NAME = 'BTech 1st Semester CSE';
export const CLASS_SUBTITLE = 'Computer Science & Engineering • 1st Semester (Core Theory & Fundamentals)';

export const INITIAL_SUBJECTS: Omit<Subject, 'id'>[] = [
  {
    name: 'Software Development Fundamentals - I',
    code: '25B11CIT111',
    order: 1,
    description: 'Computational thinking, problem decomposition, structured programming concepts, and algorithmic foundations.',
    color: '#6366F1', // Indigo
  },
  {
    name: 'Mathematics - I',
    code: '25B11MAM111',
    order: 2,
    description: 'Differential calculus, matrices, eigenvalues, linear algebra, multivariable calculus, and infinite series.',
    color: '#8B5CF6', // Purple
  },
  {
    name: 'Physics - I',
    code: '25B11PH111',
    order: 3,
    description: 'Wave optics, interference, diffraction, quantum mechanics intro, electromagnetic theory, and laser physics.',
    color: '#F43F5E', // Rose
  },
  {
    name: 'Basic Electronics',
    code: '25B11EEE111',
    order: 4,
    description: 'Semiconductors, rectifiers, zener diodes, BJT/MOSFET operation, operational amplifiers, and digital logic circuits.',
    color: '#F59E0B', // Amber
  },
  {
    name: 'Engineering Drawing & Design',
    code: '25B17MEM171',
    order: 5,
    description: 'Orthographic projections, isometric drawing, sectional views, dimensioning standards, and CAD principles.',
    color: '#10B981', // Emerald
  },
];
