
import React from 'react';
import { CloseIcon, PlayIcon } from './Icons';
import { Lesson } from '../types';

interface LessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonsModal: React.FC<LessonsModalProps> = ({ isOpen, onClose, lessons, onSelectLesson }) => {
  if (!isOpen) return null;

  const handleLessonClick = (lesson: Lesson) => {
    onSelectLesson(lesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[var(--toolbox-bg)] text-[var(--text-color)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold">Lessons</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-[var(--hint-color)]">
              <p className="text-lg font-semibold">No lessons loaded.</p>
              <p className="mt-2 text-sm">You can import lessons or projects to get started.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, index) => (
                <li key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1 mr-4">
                    <h3 className="font-bold text-lg">{lesson.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{lesson.description}</p>
                  </div>
                  <button 
                    onClick={() => handleLessonClick(lesson)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-500/80 text-white hover:bg-green-500 transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Load
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
