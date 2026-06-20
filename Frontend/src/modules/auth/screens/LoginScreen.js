import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '../validators/authSchemas';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';
import { useAuthStore } from '../../../store/useAuthStore';

export const LoginScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email_or_phone: '', password: '' }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const handleDemoBypass = (role) => {
    // Temporary bypass for demo purposes
    setAuthData({
      accessToken: 'demo_token_' + role,
      refreshToken: 'demo_refresh',
      user: {
        id: 'demo_' + role,
        role: role === 'salesman' ? 'SALESMAN' : 'MANUFACTURER',
        approval_status: 'APPROVED'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Brand Header */}
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>📦</Text>
            </View>
            <Text style={styles.brandName}>Vikas Marketing</Text>
            <Text style={styles.brandTagline}>Enterprise Sales Platform</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email / Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone</Text>
              <Controller
                control={control}
                name="email_or_phone"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputWrap, errors.email_or_phone && styles.inputError]}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email or phone"
                      value={value}
                      onChangeText={onChange}
                      placeholderTextColor={COLORS.gray400}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}
              />
              {errors.email_or_phone && <Text style={styles.errorTextInline}>{errors.email_or_phone.message}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={COLORS.gray400}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && <Text style={styles.errorTextInline}>{errors.password.message}</Text>}
            </View>

            {/* Global API Error */}
            {loginMutation.isError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {loginMutation.error?.response?.data?.message || 'Login failed'}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loginMutation.isPending && styles.loginBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>{loginMutation.isPending ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg, gap: SPACING.md }}>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterSalesman')}>
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Register as Salesman</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterDistributor')}>
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Register as Distributor</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Section */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Access</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity style={styles.demoBtn} onPress={() => handleDemoBypass('salesman')}>
                <Text style={styles.demoBtnIcon}>👤</Text>
                <Text style={styles.demoBtnLabel}>Salesman</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, styles.demoBtnAdmin]} onPress={() => handleDemoBypass('admin')}>
                <Text style={styles.demoBtnIcon}>👨‍💼</Text>
                <Text style={styles.demoBtnLabel}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl },

  // Brand
  brandSection: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  logoIcon: { fontSize: 36 },
  brandName: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  brandTagline: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: SPACING.xs, fontWeight: '500' },

  // Login Card
  loginCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, ...SHADOWS.lg,
  },
  cardTitle: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: '700', color: COLORS.gray900 },
  cardSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginTop: SPACING.xs, marginBottom: SPACING.xl },

  // Inputs
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray700, marginBottom: SPACING.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.gray50, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
  },
  inputError: { borderColor: COLORS.danger },
  inputIcon: { fontSize: 16, marginRight: SPACING.sm },
  input: { flex: 1, paddingVertical: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray900 },
  eyeBtn: { padding: SPACING.sm },
  eyeText: { fontSize: 18 },

  // Error
  errorTextInline: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.danger, marginTop: SPACING.xs, fontWeight: '500' },
  errorBox: {
    backgroundColor: COLORS.dangerLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md,
  },
  errorText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.dangerDark, fontWeight: '500' },

  // Login Button
  loginBtn: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: SPACING.sm,
    ...SHADOWS.colored(COLORS.primary),
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', letterSpacing: 0.3 },

  // Demo
  demoSection: { marginTop: SPACING.xl, alignItems: 'center' },
  demoTitle: { fontSize: TYPOGRAPHY.sizes.xs, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 1 },
  demoRow: { flexDirection: 'row', gap: SPACING.md },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  demoBtnAdmin: { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.15)' },
  demoBtnIcon: { fontSize: 18 },
  demoBtnLabel: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },
});
