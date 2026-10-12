import {useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,View,Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams} from 'expo-router';
import {ThemeModeContext,useTheme} from '../constants/theme';
import {NavigationHeader} from '../components/navigation-shell';
import {HomePostCard} from '../components/home-post-card';
import {DetailSegments,OpinionRow,OpinionComposer,DetailButton,DetailChip} from '../components/post-detail-ui';
import {OfferSheet} from '../components/offer-help';
import {Input} from '../components/ui';
import {fundingWarning,offerTypes,offerLabels,type OfferType} from '../lib/offer-model';
import type {FeedPost} from '../lib/feed-model';
const post:FeedPost={id:'preview',author_id:'preview',author_name:'Ayesha Khan · Preview',author_role:'Product designer',author_verified:true,author_photo:null,city:'Karachi',post_type:'building',created_at:new Date().toISOString(),title:'Building better professional connections',body:'I’m exploring ways for professionals to share practical ideas and offer useful help. What would make your next professional conversation more valuable?',tags:['community','design'],useful_count:12,inspiring_count:3,support_count:5,comment_count:1,offer_count:2};
function Preview(){
 const t=useTheme();const [section,setSection]=useState<'opinions'|'offers'>('opinions');const [body,setBody]=useState('');const [sheet,setSheet]=useState(false);const [type,setType]=useState<OfferType>('advice');const [message,setMessage]=useState('');const noop=()=>{};
 return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}><NavigationHeader title="Post" onBack={noop}/><ScrollView contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center'}}>
 <HomePostCard post={post} expanded contentOnly actions={{onOpen:noop,onProfile:noop,onReaction:noop,onComment:noop,onOffer:noop,onReport:noop,onHide:noop,onBlock:noop}}/>
 <DetailSegments section={section} onChange={setSection} comments={1} offers={2}/>
 {section==='opinions'?<OpinionRow name="Ali Ahmed" time={post.created_at} body="A clear question and a shared goal make a big difference."><DetailButton secondary label="Report opinion" onPress={noop}/></OpinionRow>:<DetailButton label="Offer Help" onPress={()=>setSheet(true)}/>}
 </ScrollView>{section==='opinions'?<OpinionComposer body={body} onChange={setBody} onSend={noop} busy={false} syncing={false} error={null}/>:null}
 {sheet?<OfferSheet title="Offer Help" disabled={false} close={()=>setSheet(false)}><Text style={[t.typography.body,{color:t.colors.textSecondary}]}>Your message is private to the post owner.</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>{offerTypes.map((v,i)=><DetailChip key={v} label={offerLabels[i]} selected={type===v} onPress={()=>setType(v)}/>)}</View><Input label="Short message" multiline style={{minHeight:t.layout.multiline}} value={message} onChangeText={setMessage}/>{type==='funding_interest'?<View style={{padding:t.spacing.md,backgroundColor:t.colors.warningSurface,borderRadius:t.radius.control}}><Text style={[t.typography.body,{color:t.colors.warning}]}>{fundingWarning}</Text></View>:null}<DetailButton label="Send offer" onPress={noop}/></OfferSheet>:null}
 </KeyboardAvoidingView></SafeAreaView>;
}
export default function PostPreview(){const {mode}=useLocalSearchParams<{mode?:string}>();return <ThemeModeContext.Provider value={mode==='dark'?'dark':'light'}><Preview/></ThemeModeContext.Provider>;}
