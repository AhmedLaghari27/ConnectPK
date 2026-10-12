import {useState} from 'react';
import {ScrollView,View,Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams} from 'expo-router';
import {ThemeModeContext,useTheme} from '../constants/theme';
import {NavigationHeader} from '../components/navigation-shell';
import {ProfileHeader,ProfileTabs} from '../components/profile-header';
import {SearchControls,SearchPeople,SearchEmpty} from '../components/search-ui';
import {PostCard} from '../components/feed-ui';
import type {FeedFilters,FeedPost} from '../lib/feed-model';
const post:FeedPost={id:'sample',author_id:'sample',author_name:'Ayesha Khan',author_role:'Product designer',author_verified:true,author_photo:null,city:'Karachi',post_type:'building',created_at:new Date().toISOString(),title:'Building a useful professional community',body:'Sharing practical ideas with people who are building thoughtful products.',tags:['design'],useful_count:12,inspiring_count:3,support_count:4,comment_count:2,offer_count:1};
function Preview({search,empty}:{search:boolean;empty:boolean}){
 const t=useTheme();const [tab,setTab]=useState('posts');const [value,setValue]=useState('');const [filters,setFilters]=useState<FeedFilters>({type:null,city:null,tag:''});
 return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}><NavigationHeader title={search?'Search · Preview':'My Profile · Preview'}/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,width:'100%',maxWidth:t.layout.content,alignSelf:'center'}}>
 {search?<><SearchControls value={value} onChange={setValue} filters={filters} onFilter={setFilters} onSearch={tag=>setFilters(old=>({...old,tag}))} onClear={()=>{setValue('');setFilters({type:null,city:null,tag:''});}}/>{empty?<SearchEmpty filtered={!!filters.tag}/>:<><SearchPeople posts={[post,{...post,id:'second',author_id:'second',author_name:'Ali Ahmed with a longer professional name',author_role:'Software engineer and community mentor'}]}/><PostCard post={post}/></>}</>:<><ProfileHeader profile={{full_name:'Ayesha Khan',professional_role:'Product designer',city:'Karachi',organization:'Independent Studio',independent:false,vision:'Building useful products and helping thoughtful people turn ideas into practical work.',skills:['Product design','User research','Prototyping','Community building'],can_help:'Feedback on early product ideas, user research and accessible mobile experiences.',verified:true}} photoFailed={false} onPhotoError={()=>{}} onEdit={()=>{}}/><ProfileTabs own selected={tab} onSelect={setTab}/>{tab==='posts'?<PostCard post={post}/>:<Text style={[t.typography.body,{color:t.colors.textSecondary}]}>{tab==='offers'?'Your offers appear here.':'Professional profile information.'}</Text>}</>}
 </ScrollView></SafeAreaView>;
}
export default function ProfileSearchPreview(){const {screen,mode,empty}=useLocalSearchParams<{screen?:string;mode?:string;empty?:string}>();return <ThemeModeContext.Provider value={mode==='dark'?'dark':'light'}><Preview search={screen==='search'} empty={empty==='true'}/></ThemeModeContext.Provider>;}
