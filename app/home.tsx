import {HomeFeedFilters} from '../components/home-feed-filters';
import {FeedButton} from '../components/home-post-card';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { SearchControls, SearchPeople, SearchEmpty } from '../components/search-ui';
import { HomeFeedItem } from '../components/home-feed-item';
import { getMember, myId } from '../lib/member-service';
import { FeedComposer, FeedLoadingCard, homePostLabels } from '../components/home-feed-ui';
import { EmptyState } from '../components/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, FlatList, Text, View, type ListRenderItemInfo, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ActionButton, EmailInput, ErrorMessage, LoadingSkeleton, StatusCard, useUiStyles } from '../components/onboarding-ui';
import { FeedTabs, PostCard } from '../components/feed-ui';
import { HomeNavigationHeader, NavigationHeader, useCollapsingHeader } from '../components/navigation-shell';
import { useTheme } from '../constants/theme';
import { feedCopy as c } from '../constants/feed-copy';
import { feedCursor, mergeFeedPosts, normalizeTag, postTypes, type FeedFilters, type FeedPost, type PostType } from '../lib/feed-model';
import { loadFeed, loadFeedAccess, visibleFeedIds } from '../lib/feed-service';

export default function FeedScreen({ searchMode = false }: { searchMode?: boolean }) {
  const navigationHeader = useCollapsingHeader();
  const [viewer, setViewer] = useState<{id:string;full_name:string;photoUrl?:string} | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true; const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    if (!searchMode) void myId().then(id => getMember(id, controller.signal)).then(member => { if (active) setViewer(member); }).catch(() => { if (active) setViewer(null); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [searchMode]));
  const t=useTheme(); const s=useUiStyles();
  const [filters,setFilters]=useState<FeedFilters>({type:null,city:null,tag:''});
  const [tagInput,setTagInput]=useState('');
  const [posts,setPosts]=useState<FeedPost[]>([]);
  const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false);
  const [moreLoading,setMoreLoading]=useState(false); const [hasMore,setHasMore]=useState(false);
  const [allowed,setAllowed]=useState<boolean>(); const [error,setError]=useState<string|null>(null);
  const request=useRef<AbortController|null>(null); const generation=useRef(0); const busy=useRef(false);
  const list=useRef<FlatList<FeedPost>>(null); const currentPosts=useRef<FeedPost[]>([]);
  const requestPage=useCallback(async (mode:'reset'|'refresh'|'more')=>{
    if(mode==='more' && busy.current) return;
    request.current?.abort(); const controller=new AbortController(); request.current=controller;
    const version=++generation.current; busy.current=true; setError(null);
    setMoreLoading(mode==='more'); setRefreshing(mode==='refresh'); setLoading(mode==='reset');
    if(mode!=='more') { currentPosts.current=[]; setPosts([]); setHasMore(false); }
    const timeout=setTimeout(()=>controller.abort(),15000);
    try {
      const access=await loadFeedAccess(controller.signal);
      if(version!==generation.current) return;
      setAllowed(access);
      if(!access) { currentPosts.current=[]; setPosts([]); setHasMore(false); return; }
      const page=await loadFeed(filters,mode==='more'?feedCursor(currentPosts.current):null,controller.signal);
      if(version!==generation.current) return;
      if(controller.signal.aborted) throw new Error('Request timed out');
      const next=mode==='more'?mergeFeedPosts(currentPosts.current,page):page;
      currentPosts.current=next; setPosts(next); setHasMore(page.length===20);
    } catch {
      if(version===generation.current) setError(c.error);
    } finally {
      clearTimeout(timeout);
      if(version===generation.current) {busy.current=false;setLoading(false);setRefreshing(false);setMoreLoading(false);}
    }
  },[filters]);
  useFocusEffect(useCallback(()=>{
    void requestPage('reset');
    let checking:AbortController|null=null;
    const prune=async()=>{
      if(busy.current||checking||AppState.currentState!=='active'||!currentPosts.current.length)return;
      const version=generation.current;const controller=new AbortController();checking=controller;
      const timer=setTimeout(()=>controller.abort(),15000);
      try{const visible=await visibleFeedIds(currentPosts.current.map(p=>p.id),controller.signal);
        if(version===generation.current){currentPosts.current=currentPosts.current.filter(p=>visible.has(p.id));setPosts(currentPosts.current);}}
      catch{if(version===generation.current){currentPosts.current=[];setPosts([]);setError(c.error);}}
      finally{clearTimeout(timer);checking=null;}
    };
    const timer=setInterval(()=>void prune(),15000);const foreground=AppState.addEventListener('change',state=>{if(state==='active')void prune();});
    return ()=>{ generation.current++;request.current?.abort();checking?.abort();busy.current=false;clearInterval(timer);foreground.remove(); };
  },[requestPage]));
  function updateFilters(next:FeedFilters) { setFilters(next);list.current?.scrollToOffset({offset:0,animated:false}); }
  const onRefresh = useCallback(()=>requestPage('refresh'), [requestPage]);
  const onEndReached = useCallback(()=>{if(hasMore&&!busy.current&&!error) void requestPage('more');}, [hasMore,error,requestPage]);
  const keyExtractor = useCallback((item:FeedPost)=>item.id, []);
  const renderItem = useCallback(({item}:ListRenderItemInfo<FeedPost>)=>searchMode?<PostCard post={item} onOpen={()=>router.push({pathname:"./post/[id]",params:{id:item.id}})}/>:<HomeFeedItem post={item} viewerId={viewer?.id} onHidden={onRefresh}/>, [searchMode,viewer?.id,onRefresh]);
  const headerScroll = useRef(navigationHeader.onScroll);
  useEffect(()=>{headerScroll.current=navigationHeader.onScroll;}, [navigationHeader.onScroll]);
  const onScroll = useCallback((event:NativeSyntheticEvent<NativeScrollEvent>)=>{headerScroll.current(event);setScrolled(event.nativeEvent.contentOffset.y>400);}, []);
  const header=<View style={{gap:t.spacing.md,paddingBottom:t.spacing.lg}}>
    {searchMode?<SearchControls value={tagInput} onChange={setTagInput} onSearch={value=>updateFilters({...filters,tag:normalizeTag(value)})} filters={filters} onFilter={updateFilters} onClear={()=>{setTagInput('');updateFilters({type:null,city:null,tag:''});}}/>:<>
    {!searchMode ? <FeedComposer name={viewer?.full_name} photo={viewer?.photoUrl?{uri:viewer.photoUrl}:undefined} onPress={()=>router.push('/create')} /> : null}
    <HomeFeedFilters groups={[
      {label:'Post type',options:[{value:'',label:'All'},...postTypes.map(type=>({value:type,label:homePostLabels[type]}))],selected:filters.type??'',onSelect:value=>updateFilters({...filters,type:value?value as PostType:null})},
      {label:'City',options:[{value:'',label:c.allCities},...c.cities.map(city=>({value:city,label:city}))],selected:filters.city??'',onSelect:value=>updateFilters({...filters,city:value||null})}
    ]}/>
    <View style={{flexDirection:'row',gap:t.spacing.sm,alignItems:'center'}}>
      <EmailInput accessibilityLabel={c.tag} placeholder={c.tagHint} value={tagInput} onChangeText={setTagInput} autoCapitalize="none" autoCorrect={false} maxLength={81}
        style={{flex:1}} returnKeyType="search" onSubmitEditing={()=>updateFilters({...filters,tag:normalizeTag(tagInput)})} />
      <FeedButton label={c.search} onPress={()=>updateFilters({...filters,tag:normalizeTag(tagInput)})} />
    </View>
    {filters.type || filters.city || filters.tag ? <FeedButton label={c.clear} onPress={()=>{setTagInput('');updateFilters({type:null,city:null,tag:''});}} />:null}
    </>}
    {allowed===false ? <><StatusCard symbol="○" label="MEMBERSHIP" title={c.approval} body={c.approvalBody} />
      <ActionButton label={c.verification} onPress={()=>router.push('/verification')} /></>:null}
    {error && !posts.length ? <><ErrorMessage message={error}/><FeedButton label={c.retry} onPress={()=>requestPage('reset')}/></>:null}
    {searchMode&&allowed&&!loading&&!error?<SearchPeople posts={posts}/>:null}
  </View>;
  return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}} edges={['top','left','right']}>
    {!searchMode?<HomeNavigationHeader animation={navigationHeader.style}/>:<NavigationHeader title="Search"/>}
    <Animated.FlatList itemLayoutAnimation={LinearTransition.duration(180).reduceMotion(ReduceMotion.System)} onScroll={onScroll} scrollEventThrottle={16} ref={list} data={posts} keyExtractor={keyExtractor} renderItem={renderItem}
      style={{flex:1}} contentContainerStyle={{padding:t.spacing.md,gap:searchMode?t.spacing.md:t.spacing.compact,paddingBottom:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center',flexGrow:1}}
      ListHeaderComponent={header} keyboardShouldPersistTaps="handled" initialNumToRender={5} windowSize={7}
      refreshing={refreshing} onRefresh={onRefresh}
      onEndReached={onEndReached} onEndReachedThreshold={0.3}
      ListEmptyComponent={loading?<View style={{gap:t.spacing.md}}>{searchMode?<><LoadingSkeleton/><LoadingSkeleton/></>:<><FeedLoadingCard/><FeedLoadingCard/></>}</View>:!refreshing&&allowed&&!error?searchMode?<SearchEmpty filtered={!!(filters.tag||filters.type||filters.city)}/>:<View><EmptyState title="Your next conversation starts here" description="It’s quiet here for now. Try another filter or share what you’re working on." /><FeedButton primary label="Create a post" onPress={()=>router.push('/create')}/></View>:null}
      ListFooterComponent={posts.length?<View style={{gap:t.spacing.md,paddingVertical:t.spacing.lg}}>
        {error?<><ErrorMessage message={error}/><FeedButton label={c.retry} onPress={()=>requestPage('more')}/></>:null}
        {moreLoading?(searchMode?<LoadingSkeleton/>:<FeedLoadingCard/>):hasMore&&!error?<FeedButton label={c.loadMore} onPress={()=>requestPage('more')}/>:!error?<Text style={s.note}>{c.end}</Text>:null}
      </View>:null}/>
    {!searchMode&&scrolled&&allowed?<View pointerEvents="box-none" style={{position:'absolute',bottom:120,alignSelf:'center'}}><FeedButton label={refreshing?'Checking…':'↑ Check for new posts'} disabled={refreshing||loading} onPress={()=>{list.current?.scrollToOffset({offset:0,animated:true});void requestPage('refresh');}} /></View>:null}
    <FeedTabs active={searchMode?'search':'feed'} onFeed={()=>{if(searchMode)router.replace('/home');else list.current?.scrollToOffset({offset:0,animated:true});}}/>
  </SafeAreaView>;
}
