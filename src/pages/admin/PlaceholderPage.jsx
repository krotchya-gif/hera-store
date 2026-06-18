import React from 'react';
import { Tag } from 'lucide-react';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <div className="flex flex-col items-center gap-3">
        {Icon ? <Icon className="w-12 h-12 text-gray-300" /> : <Tag className="w-12 h-12 text-gray-300" />}
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <p className="text-sm text-gray-500 max-w-md">{description}</p>
      </div>
    </div>
  );
}
