export const offerTypes=['advice','mentoring','development','funding_interest','introduction','collaboration'] as const;
export type OfferType=typeof offerTypes[number];
export type OfferStatus='pending'|'accepted'|'declined'|'withdrawn';
export type Offer={id:string;offerer_id:string;full_name:string;offer_type:OfferType;message:string;status:OfferStatus;created_at:string};
export type OfferProfile={id:string;full_name:string;headline:string|null;bio:string|null;city:string;verified:boolean};
export const offerLabels=['Advice','Mentoring','Development','Funding interest','Introduction','Collaboration'];
export const fundingWarning='Never send money to unverified people, meet in public, verify the person. ConnectPK never handles or processes money.';
export const offerStatusText:Record<OfferStatus,string>={pending:'Awaiting the post owner’s response.',accepted:'Your offer was accepted. A private conversation is ready.',declined:'Thank you for offering to help. The post owner has declined this offer.',withdrawn:'You withdrew this offer.'};
export function validateOffer(type:string,message:string) {
 if(!offerTypes.includes(type as OfferType)) return 'Choose how you would like to help.';
 if(!message.trim()||message.trim().length>1000) return 'Write a short message of 1–1,000 characters.';
 return null;
}
export function parseOffers(data:unknown):Offer[] {
 if(!Array.isArray(data)||data.some(o=>!o||!['id','offerer_id','full_name','message','created_at'].every(k=>typeof o[k]==='string')||!offerTypes.includes(o.offer_type)||!Object.hasOwn(offerStatusText,o.status))) throw new Error('Invalid offers');
 return data as Offer[];
}
