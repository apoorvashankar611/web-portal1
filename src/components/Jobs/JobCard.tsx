import React from 'react';
import { MapPin, Clock, DollarSign, Star, Users } from 'lucide-react';
import { Job } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job & { match_score?: number; matching_skills?: string[] };
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const formatBudget = () => {
    if (job.salary) {
      return `₹${job.salary.toLocaleString()}/year`;
    }
    if (job.budget_min && job.budget_max) {
      return `₹${job.budget_min.toLocaleString()} - ₹${job.budget_max.toLocaleString()}`;
    }
    return 'Budget not specified';
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{job.company}</p>
          
          {job.match_score && (
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {job.match_score}% Match
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              job.matching_skills?.includes(skill)
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{formatBudget()}</span>
          </div>
          {job.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
        </div>
      </div>

      {job.matching_skills && job.matching_skills.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Matching skills:</p>
          <div className="flex flex-wrap gap-1">
            {job.matching_skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};