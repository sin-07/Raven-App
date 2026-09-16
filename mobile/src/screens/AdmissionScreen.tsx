import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Button, Badge } from '../components';
import { AdmissionFormData } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface AdmissionScreenProps {
  navigation: any;
}

export const AdmissionScreen: React.FC<AdmissionScreenProps> = ({ navigation }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<AdmissionFormData>({
    studentName: 'Amit Raj',
    fatherName: 'Suresh Raj',
    motherName: 'Sunita Devi',
    dateOfBirth: '2008-05-14',
    gender: 'Male',
    bloodGroup: 'B+',
    category: 'General',
    phoneNumber: '9123456780',
    email: 'amit.raj2026@gmail.com',
    address: 'Kankarbagh Colony, Near Pillar 42',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800020',
    standard: 'Class 12 - JEE Main & Advanced',
    previousSchool: 'Loyola High School, Patna',
    courseType: 'annual',
    subject: 'Physics, Chemistry, Mathematics',
  });

  const standardOptions = [
    'Class 9 - Foundation & NTSE',
    'Class 10 - Board & NTSE',
    'Class 11 - JEE Main & Advanced',
    'Class 11 - NEET Medical',
    'Class 12 - JEE Main & Advanced',
    'Class 12 - NEET Medical',
    'Target Dropper Batch (JEE/NEET)',
  ];

  const genderOptions: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.studentName || !formData.dateOfBirth) {
        toast.warning('Required Details', 'Please enter your Full Name and Date of Birth.');
        return;
      }
      toast.info('Step 2: Academic Program', 'Select your target batch.');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.standard || !formData.previousSchool) {
        toast.warning('Required Details', 'Please select your Standard / Program and Previous School.');
        return;
      }
      toast.info('Step 3: Contact & Verification', 'Enter guardian phone & email.');
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.phoneNumber || !formData.fatherName) {
      toast.warning('Required Details', "Please enter Father's Name and Contact Phone Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.submitAdmission(formData);
      if (response.success) {
        setSubmittedId(response.registrationId);
        toast.success(
          'Admission Registered!',
          `Registration ID: ${response.registrationId} generated for Patna batch.`
        );
      }
    } catch {
      toast.error('Submission Failed', 'Could not process admission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= SUCCESS RECEIPT SCREEN =================
  if (submittedId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admission Confirmed</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeHeaderBtn}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#0F2E20', '#13192B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successCard}
          >
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.primaryLight} />
            </View>

            <Text style={styles.successHeading}>Application Submitted!</Text>
            <Text style={styles.successSub}>
              Welcome to Raven Tutorials Patna! Your admission application has been registered in the offline batch roster.
            </Text>

            <View style={styles.regIdContainer}>
              <Text style={styles.regIdLabel}>OFFICIAL REGISTRATION ID</Text>
              <Text style={styles.regIdValue}>{submittedId}</Text>
            </View>

            {/* Receipt Summary */}
            <View style={styles.receiptDetails}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Student Name</Text>
                <Text style={styles.receiptValue}>{formData.studentName}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Batch Program</Text>
                <Text style={styles.receiptValue}>{formData.standard}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Parent Contact</Text>
                <Text style={styles.receiptValue}>{formData.phoneNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Center</Text>
                <Text style={styles.receiptValue}>Kankarbagh Campus, Patna</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>Next Steps for Verification:</Text>
            <Text style={styles.stepItem}>1. Visit Kankarbagh Main Center with 2 passport-size photographs.</Text>
            <Text style={styles.stepItem}>2. Bring photocopy of previous standard marksheet.</Text>
            <Text style={styles.stepItem}>3. Collect your official Raven Classroom Student Kit & ID Card.</Text>
          </View>

          <Button
            title="Download Admission Slip PDF"
            variant="outline"
            icon={<Ionicons name="download-outline" size={16} color={COLORS.primaryLight} />}
            onPress={() => Alert.alert('Saved', `Receipt for ${submittedId} saved to documents.`)}
            style={{ marginBottom: SPACING.md }}
          />

          <Button
            title="Back to Student Hub"
            variant="primary"
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </View>
    );
  }

  // ================= MULTI-STEP FORM =================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admission Application</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepItemContainer}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Student Info</Text>
        </View>

        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

        <View style={styles.stepItemContainer}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Academics</Text>
        </View>

        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

        <View style={styles.stepItemContainer}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Parent & Contact</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && (
          // ================= STEP 1: PERSONAL INFO =================
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Student Personal Details</Text>
            <Text style={styles.stepDesc}>Enter candidate particulars as per Aadhaar / Birth certificate.</Text>

            <Text style={styles.inputLabel}>Full Name of Student *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amit Raj"
              placeholderTextColor={COLORS.textMuted}
              value={formData.studentName}
              onChangeText={(text) => setFormData({ ...formData, studentName: text })}
            />

            <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2008-05-14"
              placeholderTextColor={COLORS.textMuted}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
            />

            <Text style={styles.inputLabel}>Gender *</Text>
            <View style={styles.optionsRow}>
              {genderOptions.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFormData({ ...formData, gender: g })}
                  style={[styles.optionPill, formData.gender === g && styles.optionPillActive]}
                >
                  <Text style={[styles.optionPillText, formData.gender === g && styles.optionPillTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: SPACING.md }}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <TextInput
                  style={styles.input}
                  placeholder="B+"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.bloodGroup}
                  onChangeText={(text) => setFormData({ ...formData, bloodGroup: text })}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="General / OBC / SC"
                  placeholderTextColor={COLORS.textMuted}
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                />
              </View>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          // ================= STEP 2: ACADEMIC PROGRAM =================
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Academic Track Selection</Text>
            <Text style={styles.stepDesc}>Choose the batch and coaching program you wish to join.</Text>

            <Text style={styles.inputLabel}>Select Coaching Track / Standard *</Text>
            <View style={styles.standardList}>
              {standardOptions.map((std) => (
                <TouchableOpacity
                  key={std}
                  onPress={() => setFormData({ ...formData, standard: std })}
                  style={[styles.standardItem, formData.standard === std && styles.standardItemActive]}
                >
                  <Ionicons
                    name={formData.standard === std ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={formData.standard === std ? COLORS.primaryLight : COLORS.textMuted}
                  />
                  <Text style={[styles.standardItemText, formData.standard === std && styles.standardItemTextActive]}>
                    {std}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Previous School / College Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. St. Michael's High School, Patna"
              placeholderTextColor={COLORS.textMuted}
              value={formData.previousSchool}
              onChangeText={(text) => setFormData({ ...formData, previousSchool: text })}
            />
          </View>
        )}

        {currentStep === 3 && (
          // ================= STEP 3: PARENT & CONTACT =================
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Parent & Contact Information</Text>
            <Text style={styles.stepDesc}>SMS updates, attendance notifications and progress reports will be sent here.</Text>

            <Text style={styles.inputLabel}>Father's / Guardian's Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Suresh Raj"
              placeholderTextColor={COLORS.textMuted}
              value={formData.fatherName}
              onChangeText={(text) => setFormData({ ...formData, fatherName: text })}
            />

            <Text style={styles.inputLabel}>Mother's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sunita Raj"
              placeholderTextColor={COLORS.textMuted}
              value={formData.motherName}
              onChangeText={(text) => setFormData({ ...formData, motherName: text })}
            />

            <Text style={styles.inputLabel}>Primary Contact Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            />

            <Text style={styles.inputLabel}>Student Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />

            <Text style={styles.inputLabel}>Residential Address in Patna / Bihar</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              multiline
              placeholder="House/Street, Landmark, City"
              placeholderTextColor={COLORS.textMuted}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Step Buttons */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <Button
            title="Back"
            variant="secondary"
            onPress={() => setCurrentStep((prev) => (prev - 1) as any)}
            style={{ flex: 1, marginRight: SPACING.md }}
          />
        )}

        {currentStep < 3 ? (
          <Button
            title="Continue to Next Step"
            variant="primary"
            onPress={handleNext}
            style={{ flex: 2 }}
          />
        ) : (
          <Button
            title="Submit Admission Application"
            variant="primary"
            loading={isSubmitting}
            onPress={handleSubmit}
            style={{ flex: 2 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItemContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  stepNumberActive: {
    color: '#0A0E1A',
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
    marginBottom: 14,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  formScroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  stepContent: {
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionPillActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  optionPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionPillTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  standardList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  standardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  standardItemActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  standardItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  standardItemTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
  },

  // Success Screen
  successScroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  successCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.lg,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  regIdContainer: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  regIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    marginBottom: 2,
  },
  regIdValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  receiptDetails: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextStepsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.amber,
    marginBottom: SPACING.sm,
  },
  stepItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});
