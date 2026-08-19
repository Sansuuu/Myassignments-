import { Subject } from '../types';

export const CLASS_NAME = 'BTech 1st Semester CSE';
export const CLASS_SUBTITLE = 'Computer Science & Engineering • 1st Semester';

export const INITIAL_SUBJECTS: Omit<Subject, 'id'>[] = [
  {
    name: 'Programming Practices Lab - I',
    code: '25B17CIT72',
    order: 1,
    description: 'Hands-on C/Python programming, modular algorithms, pointers, memory allocation, and debugging.',
    color: '#3B82F6', // Blue
  },
  {
    name: 'Mathematics - I',
    code: '25B11MAM111',
    order: 2,
    description: 'Differential calculus, matrices, eigenvalues, linear algebra, multivariable calculus, and infinite series.',
    color: '#8B5CF6', // Purple
  },
  {
    name: 'Software Development Fundamentals Lab - I',
    code: '25B17CIT71',
    order: 3,
    description: 'Practical algorithm design, control flow, functions, testing, and Linux command-line utilities.',
    color: '#06B6D4', // Cyan
  },
  {
    name: 'Physics Lab - I',
    code: '25B17PHP171',
    order: 4,
    description: 'Laser diffraction, optical spectrometers, error analysis, magnetic field measurements, and experimental physics.',
    color: '#EC4899', // Pink
  },
  {
    name: 'Basic Electronics Lab',
    code: '25B17EEE171',
    order: 5,
    description: 'Breadboard circuit assembly, PN junction diode characteristics, transistor biasing, logic gate ICs, and CRO/DSO.',
    color: '#F59E0B', // Amber
  },
  {
    name: 'Engineering Drawing & Design',
    code: '25B17MEM171',
    order: 6,
    description: 'Orthographic projections, isometric drawing, sectional views, dimensioning standards, and CAD principles.',
    color: '#10B981', // Emerald
  },
  {
    name: 'Software Development Fundamentals - I',
    code: '25B11CIT111',
    order: 7,
    description: 'Computational thinking, problem decomposition, structured programming concepts, and algorithmic foundations.',
    color: '#6366F1', // Indigo
  },
  {
    name: 'Physics - I',
    code: '25B11PH111',
    order: 8,
    description: 'Wave optics, interference, diffraction, quantum mechanics intro, electromagnetic theory, and laser physics.',
    color: '#F43F5E', // Rose
  },
  {
    name: 'Basic Electronics',
    code: '25B11EEE111',
    order: 9,
    description: 'Semiconductors, rectifiers, zener diodes, BJT/MOSFET operation, operational amplifiers, and digital logic circuits.',
    color: '#EAB308', // Yellow
  },
];
