import { Platform, Pressable, type PressableStateCallbackType, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
const AnimatedPressable=Animated.createAnimatedComponent(Pressable);
export function FeedbackPressable({style,onPress,onPressIn,onPressOut,...props}:PressableProps){
 const scale=useSharedValue(1);
 const motion=useAnimatedStyle(()=>({transform:[{scale:scale.value}]}));
 return <AnimatedPressable {...props} onPress={event=>{
  if(Platform.OS!=='web')void Haptics.selectionAsync().catch(()=>{});
  onPress?.(event);
 }} onPressIn={event=>{scale.value=withTiming(theme.motion.pressScale,{duration:theme.motion.feedback,reduceMotion:ReduceMotion.System});onPressIn?.(event);}}
 onPressOut={event=>{scale.value=withTiming(1,{duration:theme.motion.feedback,reduceMotion:ReduceMotion.System});onPressOut?.(event);}}
 style={(state:PressableStateCallbackType)=>[{minWidth:theme.layout.touch,minHeight:theme.layout.touch},typeof style==='function'?style(state):style,motion]}/>;
}
