import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Avatar } from './ui';
import {DetailButton,DetailChip as Chip} from './post-detail-ui';
import {HomeFeedFilters} from './home-feed-filters';
import { homePostLabels } from './home-feed-ui';
import { useTheme } from '../constants/theme';
import { feedCopy as c } from '../constants/feed-copy';
import { postTypes, type FeedFilters, type FeedPost, type PostType } from '../lib/feed-model';

export function SearchControls({value,onChange,onSearch,filters,onFilter,onClear}:{value:string;onChange:(value:string)=>void;onSearch:(value:string)=>void;filters:FeedFilters;onFilter:(value:FeedFilters)=>void;onClear:()=>void}) {
  const t=useTheme();const [recent,setRecent]=useState<string[]>([]);
  function submit(text:string){
    if(text.trim())setRecent(previous=>[text,...previous.filter(item=>item!==text)].slice(0,5));
    onSearch(text);
  }
  return <View style={{gap:t.spacing.md}}>
    <Text style={[t.typography.body,{color:t.colors.textSecondary}]}>Find useful work and the people behind it.</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm,paddingStart:t.spacing.md,borderRadius:t.radius.control,backgroundColor:t.colors.surface,borderWidth:t.border.thin,borderColor:t.colors.border}}>
      <Ionicons name="search-outline" size={t.layout.icon} color={t.colors.textSecondary}/>
      <TextInput accessibilityLabel={c.tag} placeholder="Search a tag, e.g. design" placeholderTextColor={t.colors.textSecondary} value={value} onChangeText={onChange} autoCapitalize="none" autoCorrect={false} maxLength={81} returnKeyType="search" onSubmitEditing={()=>submit(value)} style={[t.typography.body,{flex:1,minWidth:0,minHeight:t.layout.control,color:t.colors.text,paddingVertical:t.spacing.sm}]}/>
      <DetailButton secondary label="Search" onPress={()=>submit(value)}/>
    </View>
    <Text style={[t.typography.caption,{color:t.colors.textSecondary}]}>Search uses one exact tag. People shown are authors of the matching posts.</Text>
    {recent.length?<View style={{gap:t.spacing.sm}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:t.spacing.sm}}><Text style={[t.typography.label,{color:t.colors.text}]}>Recent searches</Text><DetailButton secondary label="Clear history" onPress={()=>setRecent([])}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{gap:t.spacing.sm}}>{recent.map(term=><Chip key={term} label={term} onPress={()=>{onChange(term);submit(term);}}/>)}</ScrollView>
    </View>:null}
    <HomeFeedFilters groups={[
      {label:'Post type',options:[{value:'',label:'All'},...postTypes.map(type=>({value:type,label:homePostLabels[type]}))],selected:filters.type??'',onSelect:value=>onFilter({...filters,type:value?value as PostType:null})},
      {label:'City',options:[{value:'',label:c.allCities},...c.cities.map(city=>({value:city,label:city}))],selected:filters.city??'',onSelect:value=>onFilter({...filters,city:value||null})}
    ]}/>
    {filters.type||filters.city||filters.tag?<DetailButton secondary label={c.clear} onPress={onClear}/>:null}
  </View>;
}

export function SearchPeople({posts}:{posts:FeedPost[]}) {
  const t=useTheme();
  const people=[...new Map(posts.map(post=>[post.author_id,post])).values()];
  if(!people.length)return null;
  return <View style={{gap:t.spacing.md}}>
    <Text accessibilityRole="header" style={[t.typography.heading,{color:t.colors.text}]}>People</Text>
    <View style={{gap:t.spacing.sm}}>
      {people.map(person=><Pressable key={person.author_id} accessibilityRole="button" accessibilityLabel={`View ${person.author_name}'s profile`} onPress={()=>router.push({pathname:'./member/[id]',params:{id:person.author_id}})} style={({pressed})=>({padding:t.spacing.md,gap:t.spacing.compact,flexDirection:'row',alignItems:'center',borderRadius:t.radius.control,borderWidth:t.border.thin,borderColor:t.colors.border,backgroundColor:t.colors.surface,opacity:pressed?0.7:1})}>
        <Avatar name={person.author_name} source={person.photoUrl?{uri:person.photoUrl}:undefined} verified={person.author_verified} size={t.avatar.medium}/><View style={{flex:1,minWidth:0,gap:t.spacing.xs}}>
        <Text numberOfLines={1} style={[t.typography.label,{color:t.colors.text}]}>{person.author_name}</Text>
        <Text numberOfLines={2} style={[t.typography.caption,{color:t.colors.textSecondary}]}>{person.author_role||c.roleFallback}</Text>
      </View></Pressable>)}
    </View>
    <Text accessibilityRole="header" style={[t.typography.heading,{color:t.colors.text}]}>Posts</Text>
  </View>;
}

export function SearchEmpty({filtered}:{filtered:boolean}) {
 const t=useTheme();return <View style={{padding:t.spacing.md,gap:t.spacing.sm,alignItems:'flex-start'}}><Ionicons name="search-outline" size={t.layout.icon} color={t.colors.textSecondary}/><Text accessibilityRole="header" style={[t.typography.subtitle,{color:t.colors.text}]}>{filtered?'No results found':'Explore professional posts'}</Text><Text style={[t.typography.body,{color:t.colors.textSecondary}]}>{filtered?'Try a different tag or clear your filters.':'Search an exact tag to find posts and the people behind them.'}</Text></View>;
}
