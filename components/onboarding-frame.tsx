import type { PropsWithChildren, ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../constants/theme';

export function OnboardingFrame({title,subtitle,progress,children,header,footer}:PropsWithChildren<{title:string;subtitle?:string;progress?:ReactNode;header?:ReactNode;footer?:ReactNode}>) {
 const t=useTheme();
 return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}>
  {header}
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,padding:t.spacing.md}}>
    <View style={{width:'100%',maxWidth:t.layout.content,alignSelf:'center',gap:t.spacing.lg,paddingVertical:t.spacing.md}}>
     {!header?<View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.compact}}><Image source={require('../assets/logo.png')} accessibilityLabel="ConnectPK logo" style={{width:t.layout.control,height:t.layout.control,borderRadius:t.radius.md}}/><Text style={[t.typography.heading,{color:t.colors.text}]}>ConnectPK</Text></View>:null}
     {progress}
     <View style={{gap:t.spacing.sm}}>{!header?<Text accessibilityRole="header" style={[t.typography.title,{color:t.colors.text}]}>{title}</Text>:null}{subtitle?<Text style={[t.typography.body,{color:t.colors.textSecondary}]}>{subtitle}</Text>:null}</View>
     <View style={{gap:t.spacing.md}}>{children}</View>
    </View>
   </ScrollView>
   {footer?<View style={{backgroundColor:t.colors.surface,borderTopWidth:t.border.thin,borderColor:t.colors.border}}><View style={{width:'100%',maxWidth:t.layout.content,alignSelf:'center',padding:t.spacing.md,gap:t.spacing.sm}}>{footer}</View></View>:null}
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
