import 'server-only'
import { UnavailableRetailerProvider } from './provider'

export const retailerProviders = {
  coles: new UnavailableRetailerProvider('coles', 'Coles', 'No authorised customer product-pricing API or licensed feed has been configured.'),
  woolworths: new UnavailableRetailerProvider('woolworths', 'Woolworths', 'No authorised feed has been configured; Woolworths site terms prohibit automated retrieval or indexing.'),
}
