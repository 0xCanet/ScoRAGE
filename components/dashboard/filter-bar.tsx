export function FilterBar() {
  return (
    <div className="filter-bar">
      <button className="filter-bar__btn is-active">Toutes les analyses</button>
      <button className="filter-bar__btn">Terminées</button>
      <button className="filter-bar__btn">En cours</button>
      <button className="filter-bar__btn">Échecs</button>
    </div>
  );
}
