import React from 'react';

const SkeletonElement = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="loading-skeleton">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>

          {/* Profile Info */}
          <div className="flex-1">
            <SkeletonElement className="h-8 w-1/2 mb-4" />
            <SkeletonElement className="h-4 w-1/3 mb-4" />
            <SkeletonElement className="h-4 w-full" />
            <SkeletonElement className="h-4 w-3/4 mt-2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <SkeletonElement className="h-6 w-1/3 mb-6" />
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <SkeletonElement className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <SkeletonElement className="h-4 w-1/4 mb-2" />
                  <SkeletonElement className="h-4 w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SkeletonElement className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <SkeletonElement className="h-4 w-1/4 mb-2" />
                  <SkeletonElement className="h-4 w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SkeletonElement className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <SkeletonElement className="h-4 w-1/4 mb-2" />
                  <SkeletonElement className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <SkeletonElement className="h-6 w-1/2 mb-6" />
            <div className="space-y-4">
              <SkeletonElement className="h-4 w-full" />
              <SkeletonElement className="h-4 w-full" />
              <SkeletonElement className="h-4 w-full" />
              <SkeletonElement className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingSkeleton;
