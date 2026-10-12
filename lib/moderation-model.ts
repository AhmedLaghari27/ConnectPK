export const reportCategories={romantic_sexual:'Romantic or sexual content',harassment:'Harassment',scam_fraud:'Scam or fraud',pyramid_scheme:'Pyramid scheme',repeated_selling:'Repeated selling',lead_harvesting:'Lead harvesting',discrimination:'Discrimination',private_information:'Sharing private information'} as const;
export type ReportCategory=keyof typeof reportCategories;
export type ReportTarget={kind:'post'|'comment'|'offer'|'message'|'profile';id:string};
export function validateReport(category:string,description:string){
 if(!Object.hasOwn(reportCategories,category))return 'Choose the category that best describes the problem.';
 if(!description.trim()||description.trim().length>2000)return 'Please describe what happened in 1–2,000 characters.';
 return null;
}
