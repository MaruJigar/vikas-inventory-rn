import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDistributorSchema } from '../validators/authSchemas';
import { useRegisterDistributorMutation } from '../hooks/useAuthMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../styles/colors';

export const RegisterDistributorScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterDistributorMutation();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(RegisterDistributorSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '', business_name: '', gst_number: '' }
  });

  const onSubmit = (data) => {
    // Clean up empty optional fields
    const payload = { ...data };
    if (!payload.gst_number) delete payload.gst_number;

    registerMutation.mutate(payload, {
      onSuccess: () => {
        alert("Registration Successful! Please wait for approval.");
        navigation.goBack();
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Distributor Registration</Text>
          
          {['full_name', 'email', 'phone', 'business_name', 'gst_number'].map((field) => (
             <View style={styles.inputGroup} key={field}>
               <Text style={styles.label}>{field.replace('_', ' ').toUpperCase()} {field === 'gst_number' ? '(OPTIONAL)' : ''}</Text>
               <Controller
                 control={control}
                 name={field}
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={styles.input}
                     value={value}
                     onChangeText={onChange}
                     placeholder={`Enter ${field.replace('_', ' ')}`}
                     autoCapitalize={field === 'email' ? 'none' : 'words'}
                   />
                 )}
               />
               {errors[field] && <Text style={styles.errorTextInline}>{errors[field].message}</Text>}
             </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                />
              )}
            />
            {errors.password && <Text style={styles.errorTextInline}>{errors.password.message}</Text>}
          </View>

          {registerMutation.isError && <Text style={styles.errorTextInline}>{registerMutation.error?.response?.data?.message || 'Registration failed'}</Text>}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
             <Text style={styles.submitBtnText}>{registerMutation.isPending ? 'Registering...' : 'Register'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: COLORS.primary }}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: SPACING.xl },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.xl },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 12, color: COLORS.gray700, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  errorTextInline: { color: COLORS.danger, fontSize: 12, marginTop: 5 },
  submitBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, alignItems: 'center', borderRadius: BORDER_RADIUS.md, marginTop: SPACING.lg },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold' }
});
