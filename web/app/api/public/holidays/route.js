export const dynamic = 'force-dynamic';

const publicController = require('@/lib/controllers/publicController');

export async function GET() {
  return publicController.listHolidaysPublic();
}
