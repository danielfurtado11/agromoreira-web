// Convenience aliases for the types generated in `schema.ts`, so we can write
// `Product` instead of `components["schemas"]["ProductRead"]`.
//
// NOTE: `schema.ts` is generated automatically (`pnpm gen:api`). Never edit it
// by hand — any changes would be overwritten on the next generation.
import type { components } from "./schema";

type Schemas = components["schemas"];

// Catalogue
export type Product = Schemas["ProductRead"];
export type ProductDetail = Schemas["ProductDetail"];
export type ProductImage = Schemas["ProductImageRead"];
export type Category = Schemas["CategoryRead"];
export type Unit = Schemas["UnitRead"];

// Stores & staff
export type Store = Schemas["StoreRead"];
export type StoreSummary = Schemas["StoreSummary"];
export type Employee = Schemas["EmployeeRead"];

// Content
export type Post = Schemas["PostRead"];
export type Announcement = Schemas["AnnouncementRead"];
export type AboutUs = Schemas["AboutUsRead"];

// Brands (partner logos in the homepage marquee)
export type Brand = Schemas["BrandRead"];
