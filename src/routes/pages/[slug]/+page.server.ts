import type { PageServerLoad } from "./$types";
import { getPageBySlug } from "/src/lib/server/content";

export const load: PageServerLoad = async ({ params }) => {
    return {
        page: getPageBySlug(params.slug)
    };
};

