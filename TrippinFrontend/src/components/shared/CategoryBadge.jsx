import { Waves, Mountain, Building2, Landmark, Compass } from 'lucide-react';

const categoryConfig = {
  beach: { icon: Waves },
  mountains: { icon: Mountain },
  city: { icon: Building2 },
  cultural: { icon: Landmark },
  adventure: { icon: Compass },
};

export default function CategoryBadge({ category }) {
  const config = categoryConfig[category?.toLowerCase()] || categoryConfig.adventure;
  const Icon = config.icon;

  return (
    <span className={`category-badge ${category?.toLowerCase()}`}>
      <Icon size={12} />
      {category}
    </span>
  );
}
