import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyStats } from '../types/review';
import Pagination from './Pagination';
import './PropertyStatsList.css';

interface PropertyStatsListProps {
  stats: PropertyStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedProperty: string;
  onPropertySelect: (propertyId: string) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: string) => void;
  loading: boolean;
}

function PropertyStatsList({
  stats,
  pagination,
  selectedProperty,
  onPropertySelect,
  onPageChange,
  onFilterChange,
  loading,
}: PropertyStatsListProps) {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState('');

  const handlePropertyClick = (propertyId: string, e: React.MouseEvent) => {
    // Navigate to property page
    navigate(`/property/${propertyId}`);
  };

  const handleFilterClick = (propertyId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent navigation
    e.stopPropagation();
    // Filter reviews in dashboard
    onPropertySelect(propertyId);
  };

  const getRatingColor = (rating: number | null) => {
    if (rating === null) return '#999';
    if (rating >= 4.5) return '#10b981'; // green
    if (rating >= 4.0) return '#3b82f6'; // blue
    if (rating >= 3.0) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const findLowCategories = (property: PropertyStats): string[] => {
    const lowCategories: string[] = [];
    Object.entries(property.categoryAverages).forEach(([category, avg]) => {
      if (avg < 3.5) {
        lowCategories.push(category);
      }
    });
    return lowCategories;
  };

  if (loading) {
    return (
      <div className="property-stats-list">
        <div className="loading">Loading properties...</div>
      </div>
    );
  }

  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    onFilterChange(value);
  };

  const handleClearFilter = () => {
    setFilterValue('');
    onFilterChange('');
  };

  return (
    <div className="property-stats-list">
      <div className="property-stats-header">
        <h2>Properties</h2>
        <div className="property-filter">
          <input
            type="text"
            placeholder="Filter properties..."
            value={filterValue}
            onChange={handleFilterInputChange}
            className="property-filter-input"
          />
          {filterValue && (
            <button
              className="property-filter-clear"
              onClick={handleClearFilter}
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="stats-grid">
        {stats.length === 0 ? (
          <div className="no-results">
            <p>No properties found matching your filter.</p>
          </div>
        ) : (
          stats.map((property) => {
          const isSelected = selectedProperty === property.propertyId;
          const lowCategories = findLowCategories(property);

          return (
            <div
              key={property.propertyId}
              className={`stat-card ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handlePropertyClick(property.propertyId, e)}
            >
              <div className="property-header">
                <h3 className="property-name">{property.propertyName}</h3>
                {property.averageRating !== null && (
                  <div
                    className="rating-badge"
                    style={{ backgroundColor: getRatingColor(property.averageRating) }}
                  >
                    {property.averageRating.toFixed(1)}
                  </div>
                )}
              </div>

              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Total Reviews</span>
                  <span className="stat-value">{property.totalReviews}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Approved</span>
                  <span className="stat-value approved">
                    {property.approvedReviews}
                  </span>
                </div>
              </div>

              {lowCategories.length > 0 && (
                <div className="warning-badge">
                  ⚠️ Low ratings in: {lowCategories.slice(0, 2).join(', ')}
                </div>
              )}

              <div className="property-actions">
                <button
                  className="view-page-btn"
                  onClick={(e) => handlePropertyClick(property.propertyId, e)}
                >
                  View Public Page →
                </button>
                <button
                  className={`filter-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => handleFilterClick(property.propertyId, e)}
                  title="Filter reviews in dashboard"
                >
                  {isSelected ? '✓ Filtered' : 'Filter'}
                </button>
              </div>
            </div>
          );
          })
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        total={pagination.total}
        limit={pagination.limit}
      />
    </div>
  );
}

export default PropertyStatsList;

