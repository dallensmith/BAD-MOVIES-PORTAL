import { Users, Search, Filter } from 'lucide-react';

const PeoplePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">People</h1>
        <p className="text-secondary-600 mt-1">
          Browse actors, directors, and crew members from your movie experiments
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
        <Users className="w-16 h-16 text-secondary-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
          People Management Coming Soon
        </h2>
        <p className="text-secondary-600 max-w-md mx-auto">
          This feature will allow you to browse and manage all the actors, directors, 
          and crew members from your movie experiments. You'll be able to see their 
          filmographies, relationships, and more.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="p-4 border border-secondary-200 rounded-lg">
            <Search className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-medium text-secondary-900 mb-2">Search & Filter</h3>
            <p className="text-sm text-secondary-600">
              Find people by name, department, or movie appearances
            </p>
          </div>
          
          <div className="p-4 border border-secondary-200 rounded-lg">
            <Users className="w-8 h-8 text-accent-600 mx-auto mb-3" />
            <h3 className="font-medium text-secondary-900 mb-2">Detailed Profiles</h3>
            <p className="text-sm text-secondary-600">
              View complete filmographies and biographical information
            </p>
          </div>
          
          <div className="p-4 border border-secondary-200 rounded-lg">
            <Filter className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-secondary-900 mb-2">Smart Connections</h3>
            <p className="text-sm text-secondary-600">
              Discover relationships between cast and crew members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
