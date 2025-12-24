import { ReviewFilters } from "../services/api";
import { PropertyStats } from "../types/review";
import { useChannels } from "../hooks/useReviews";
import "./FilterPanel.css";

interface FilterPanelProps {
	filters: ReviewFilters;
	onFilterChange: (filters: Partial<ReviewFilters>) => void;
	onClearFilters: () => void;
	propertyStats: PropertyStats[];
}

function FilterPanel({ filters, onFilterChange, onClearFilters }: FilterPanelProps) {
	const { data: channels = [], isLoading: channelsLoading } = useChannels();
	const allCategories = [
		"cleanliness",
		"communication",
		"respect_house_rules",
		"check_in",
		"accuracy",
		"location",
		"value",
	];

	const hasActiveFilters =
		filters.minRating !== undefined ||
		filters.maxRating !== undefined ||
		filters.category ||
		filters.channel ||
		filters.type ||
		filters.from ||
		filters.to ||
		filters.approved !== undefined ||
		filters.sortBy;

	return (
		<div className="filter-panel">
			<div className="filter-header">
				<h2>Filters & Sorting</h2>
				{hasActiveFilters && (
					<button onClick={onClearFilters} className="clear-filters-btn">
						Clear All
					</button>
				)}
			</div>

			<div className="filters-grid">
				<div className="filter-group">
					<label>Rating Range</label>
					<div className="rating-range">
						<input
							type="number"
							min="0"
							max="5"
							step="0.1"
							placeholder="Min"
							value={filters.minRating || ""}
							onChange={(e) =>
								onFilterChange({
									minRating: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
						/>
						<span>to</span>
						<input
							type="number"
							min="0"
							max="5"
							step="0.1"
							placeholder="Max"
							value={filters.maxRating || ""}
							onChange={(e) =>
								onFilterChange({
									maxRating: e.target.value ? parseFloat(e.target.value) : undefined,
								})
							}
						/>
					</div>
				</div>

				<div className="filter-group">
					<label>Category</label>
					<select
						value={filters.category || ""}
						onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
					>
						<option value="">All Categories</option>
						{allCategories.map((cat) => (
							<option key={cat} value={cat}>
								{cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label>Channel</label>
					<select
						value={filters.channel || ""}
						onChange={(e) =>
							onFilterChange({
								channel: e.target.value || undefined,
							})
						}
						disabled={channelsLoading}
					>
						<option value="">All Channels</option>
						{channels.map((channel) => (
							<option key={channel} value={channel}>
								{channel.charAt(0).toUpperCase() + channel.slice(1)}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label>Review Type</label>
					<select
						value={filters.type || ""}
						onChange={(e) =>
							onFilterChange({
								type: (e.target.value as "guest-to-host" | "host-to-guest") || undefined,
							})
						}
					>
						<option value="">All Types</option>
						<option value="guest-to-host">Guest to Host</option>
						<option value="host-to-guest">Host to Guest</option>
					</select>
				</div>

				<div className="filter-group">
					<label>Approval Status</label>
					<select
						value={filters.approved === undefined ? "" : filters.approved ? "true" : "false"}
						onChange={(e) => {
							const value = e.target.value;
							onFilterChange({
								approved: value === "" ? undefined : value === "true",
							});
						}}
					>
						<option value="">All</option>
						<option value="true">Approved Only</option>
						<option value="false">Not Approved</option>
					</select>
				</div>

				<div className="filter-group">
					<label>Date From</label>
					<input
						type="date"
						value={filters.from || ""}
						onChange={(e) => onFilterChange({ from: e.target.value || undefined })}
					/>
				</div>

				<div className="filter-group">
					<label>Date To</label>
					<input
						type="date"
						value={filters.to || ""}
						onChange={(e) => onFilterChange({ to: e.target.value || undefined })}
					/>
				</div>

				<div className="filter-group">
					<label>Sort By</label>
					<select
						value={filters.sortBy || ""}
						onChange={(e) =>
							onFilterChange({
								sortBy:
									(e.target.value as "submittedAt" | "overallRating" | "propertyName") || undefined,
							})
						}
					>
						<option value="">Default</option>
						<option value="submittedAt">Date</option>
						<option value="overallRating">Rating</option>
						<option value="propertyName">Property Name</option>
					</select>
				</div>

				{filters.sortBy && (
					<div className="filter-group">
						<label>Sort Direction</label>
						<select
							value={filters.sortDir || "desc"}
							onChange={(e) =>
								onFilterChange({
									sortDir: (e.target.value as "asc" | "desc") || "desc",
								})
							}
						>
							<option value="desc">Descending</option>
							<option value="asc">Ascending</option>
						</select>
					</div>
				)}
			</div>
		</div>
	);
}

export default FilterPanel;
