import { Palmtree, Mountain, Building2, Landmark, Compass, Trees, Globe } from 'lucide-react';

const categoryConfig = {
  all: { icon: Globe },
  beach: { icon: Palmtree },
  mountains: { icon: Mountain },
  city: { icon: Building2 },
  cultural: { icon: Landmark },
  adventure: { icon: Compass },
  nature: { icon: Trees },
};

export default function CategoryBadge({ category }) {
  const config = categoryConfig[category?.toLowerCase()] || categoryConfig.adventure;
  const Icon = config.icon;

  return (
    <span className={`category-badge ${category?.toLowerCase()}`}>
      <Icon size={12} strokeWidth={2.5} />
      {category}
    </span>
  );
}
