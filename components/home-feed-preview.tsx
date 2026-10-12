import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../constants/theme';
import { HomePostCard, FeedButton } from './home-post-card';
import { FeedComposer, FeedLoadingCard, homePostLabels } from './home-feed-ui';
import { HomeFeedFilters } from './home-feed-filters';
import { EmptyState } from './ui';
import type { FeedPost } from '../lib/feed-model';
const post: FeedPost = {id:'preview',author_id:'preview',post_type:'building',author_name:'Ayesha Khan with a very long professional name',author_role:'Software engineer',author_verified:true,author_photo:null,city:'Karachi',created_at:new Date().toISOString(),title:'Building a better way for professionals to help each other',body:'We are building tools that help local professionals exchange practical ideas. '.repeat(12),tags:['building','community','averylongtagwithoutspacesforoverflowtesting'],useful_count:1234,inspiring_count:23,support_count:4,comment_count:12,offer_count:3};
export function HomeFeedPreview() {
 const t=useTheme(); const [selected,setSelected]=useState(''); const [note,setNote]=useState('');
 const action=()=>setNote('Existing action placeholder — no network requests.');
 return <View style={{gap:t.spacing.compact}}><FeedComposer name="Ayesha" onPress={action}/><HomeFeedFilters groups={[{label:'Post type',options:[{value:'',label:'All'},...Object.entries(homePostLabels).map(([value,label])=>({value,label}))],selected,onSelect:setSelected}]}/>
 <HomePostCard post={post} actions={{onOpen:action,onProfile:action,onReaction:action,onComment:action,onOffer:action,onReport:action,onHide:action,onBlock:action}}/>
 <HomePostCard post={{...post,id:'short',author_name:'Ali',title:'Hello',body:'A short update.',tags:[],author_verified:false}} actions={{onOpen:action,onProfile:action,onReaction:action,onComment:action,onOffer:action,onReport:action,onHide:action,onBlock:action}}/>
 <Text style={[t.typography.caption,{color:t.colors.text}]}>{note}</Text><FeedLoadingCard/><EmptyState title="No posts yet" description="Try another filter."/><Text style={{color:t.colors.error}}>Couldn’t load the feed.</Text><FeedButton label="Retry" onPress={action}/></View>;
}
