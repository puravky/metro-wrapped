# Delhi Metro data

The generated network is a working, versioned snapshot for the MetroWrapped estimator.

Planned source order:

1. Delhi Open Transit Data DMRC GTFS, currently consumed through a public mirror of the official feed.
2. Current DMRC network map and operational-opening pages for the 2025 and 2026 extensions.
3. Coordinate-derived segment estimates until audited track distances are available.
4. Manual checks against the DMRC journey planner for representative routes and fare boundaries.

Run `node scripts/import-gtfs.mjs /path/to/gtfs-directory` to regenerate the snapshot. The gated official GTFS zip can replace the mirror without changing application code.

Airport Express, Noida Aqua Line and Rapid Metro Gurugram are excluded from v1. Distance, time and fare outputs are explicitly presented as estimates.
