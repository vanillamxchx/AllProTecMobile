function hasTerm(value, terms) {
  return terms.some((term) => value.includes(term));
}

export function getServiceDescription(service = {}) {
  const savedDescription = String(
    service.description ||
      service.desc ||
      service.summary ||
      service.details ||
      service.longDescription ||
      ""
  ).trim();
  const name = String(service.name || service.title || service.serviceName || "").toLowerCase();
  const hasUsableSavedDescription =
    savedDescription &&
    !["-", "...", "…", "n/a", "na", "none", "null", "undefined"].includes(
      savedDescription.toLowerCase()
    );
  if (hasUsableSavedDescription) return savedDescription;

  if (hasTerm(name, ["motor coating", "motorcycle coating"])) {
    return "Cleans and protects motorcycle surfaces with a durable, glossy coating.";
  }
  if (hasTerm(name, ["car wash", "carwash"])) {
    return "A thorough exterior wash that removes dirt and leaves a clean finish.";
  }

  if (hasTerm(name, ["ceramic", "coating"])) {
    return "Protects your paint with a durable, glossy protective finish.";
  }
  if (hasTerm(name, ["paint correction", "buff", "polish"])) {
    return "Improves paint clarity by reducing light swirls and surface imperfections.";
  }
  if (hasTerm(name, ["interior", "upholstery"])) {
    return "Deep-cleans interior surfaces, seats, and hard-to-reach areas.";
  }
  if (hasTerm(name, ["engine"])) {
    return "Carefully cleans and refreshes visible engine-bay surfaces.";
  }
  if (hasTerm(name, ["wash", "wax", "exterior"])) {
    return "Cleans exterior surfaces and restores a fresh, protected finish.";
  }
  if (hasTerm(name, ["package", "bundle", "combo", "+"])) {
    return "A combined vehicle-care package for complete exterior and interior care.";
  }

  return "Professional vehicle care tailored to your vehicle’s needs.";
}
