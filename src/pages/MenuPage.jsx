import ProductGrid from '../components/ProductGrid.jsx';

export default function MenuPage({ filter, onFilter, onAdd, onOpen }) {
  return (
    <>
      <ProductGrid
        filter={filter}
        onFilter={onFilter}
        onAdd={onAdd}
        onOpen={onOpen}
        onViewAll={() => onFilter('all')}
      />
    </>
  );
}
