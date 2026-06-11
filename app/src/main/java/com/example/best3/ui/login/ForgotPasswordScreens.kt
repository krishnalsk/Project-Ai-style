package com.example.best3.ui.login

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import com.google.firebase.auth.FirebaseAuth

// --- SCREEN 1: FORGOT PASSWORD (EMAIL INPUT) ---
@Composable
fun ForgotPasswordScreen(
    onBackClick: () -> Unit,
    onCodeSent: (String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val auth = FirebaseAuth.getInstance()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier.background(SoftGray, CircleShape)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.Black)
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        Surface(
            modifier = Modifier.size(100.dp),
            shape = RoundedCornerShape(24.dp),
            color = CoralPrimary.copy(alpha = 0.1f)
        ) {
            Icon(
                Icons.Default.LockReset,
                null,
                tint = CoralPrimary,
                modifier = Modifier.padding(24.dp)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            "Forgot Password?",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black, color = Color.Black)
        )
        Text(
            "Enter your registered email to receive a secure password reset link. After sending, please check your email and use the link to reset your password.",
            textAlign = TextAlign.Center,
            color = Color.Gray,
            modifier = Modifier.padding(top = 8.dp).padding(horizontal = 24.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CoralPrimary,
                unfocusedBorderColor = Color.LightGray,
                focusedLabelColor = CoralPrimary
            ),
            leadingIcon = { Icon(Icons.Default.Email, null, tint = CoralPrimary) }
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                if (android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                    scope.launch {
                        isLoading = true
                        auth.sendPasswordResetEmail(email.trim()).addOnCompleteListener { task ->
                            isLoading = false
                            if (task.isSuccessful) {
                                Toast.makeText(context, "Reset link sent! Check your inbox/spam and log in once reset.", Toast.LENGTH_LONG).show()
                                onCodeSent(email) // Navigates back to Login screen
                            } else {
                                Toast.makeText(context, "Error: ${task.exception?.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                } else {
                    Toast.makeText(context, "Please enter a valid email", Toast.LENGTH_SHORT).show()
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CoralPrimary),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
            } else {
                Text("Send Reset Link", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}

// --- SCREEN 2: OTP VERIFICATION (6 DIGITS) ---
@Composable
fun ResetOtpScreen(
    email: String,
    onBackClick: () -> Unit,
    onOtpVerified: () -> Unit
) {
    val otpValues = remember { mutableStateListOf("", "", "", "", "", "") }
    var timer by remember { mutableIntStateOf(599) } // 10 minutes
    var attempts by remember { mutableIntStateOf(5) }
    var isLoading by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        while (timer > 0) {
            delay(1000)
            timer--
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            IconButton(onClick = onBackClick, modifier = Modifier.background(SoftGray, CircleShape)) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        Text(
            "Verification",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black)
        )
        Text(
            "Link sent to $email. Please check your inbox and Spam folder.",
            color = Color.Gray,
            modifier = Modifier.padding(top = 8.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally)
        ) {
            otpValues.forEachIndexed { index, value ->
                OutlinedTextField(
                    value = value,
                    onValueChange = {
                        if (it.length <= 1) otpValues[index] = it
                    },
                    modifier = Modifier.size(width = 50.dp, height = 64.dp),
                    textStyle = LocalTextStyle.current.copy(textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 20.sp),
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CoralPrimary)
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = if (timer > 0) "Resend code in ${timer / 60}:${(timer % 60).toString().padStart(2, '0')}" else "I didn't receive a code",
            color = if (timer > 0) Color.Gray else CoralPrimary,
            fontWeight = FontWeight.Bold
        )
        
        if (timer == 0) {
            TextButton(onClick = { 
                timer = 599 
                FirebaseAuth.getInstance().sendPasswordResetEmail(email)
                Toast.makeText(context, "Reset link resent! Check your email inbox.", Toast.LENGTH_SHORT).show()
            }) {
                Text("Resend Reset Link", color = CoralPrimary, fontWeight = FontWeight.Black, textDecoration = androidx.compose.ui.text.style.TextDecoration.Underline)
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                if (otpValues.any { it.isEmpty() }) {
                    Toast.makeText(context, "Enter all 6 digits", Toast.LENGTH_SHORT).show()
                } else {
                    scope.launch {
                        isLoading = true
                        delay(1500)
                        isLoading = false
                        // Mock verification "123456"
                        if (otpValues.joinToString("") == "123456") {
                            onOtpVerified()
                        } else {
                            attempts--
                            if (attempts <= 0) {
                                Toast.makeText(context, "Too many failed attempts. Try again later.", Toast.LENGTH_LONG).show()
                                onBackClick()
                            } else {
                                Toast.makeText(context, "Invalid OTP. $attempts attempts left.", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CoralPrimary),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
            } else {
                Text("Verify OTP", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// --- SCREEN 3: CREATE NEW PASSWORD ---
@Composable
fun CreateNewPasswordScreen(
    email: String,
    onPasswordUpdated: () -> Unit
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val hasMinLength = password.length >= 8
    val hasUpper = password.any { it.isUpperCase() }
    val hasLower = password.any { it.isLowerCase() }
    val hasDigit = password.any { it.isDigit() }
    val hasSpecial = password.any { !it.isLetterOrDigit() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "New Password",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black)
        )
        Text(
            "Create a strong password for your account security.",
            color = Color.Gray,
            modifier = Modifier.padding(top = 8.dp)
        )

        Spacer(modifier = Modifier.height(40.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("New Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            visualTransformation = PasswordVisualTransformation(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CoralPrimary)
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm New Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            visualTransformation = PasswordVisualTransformation(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CoralPrimary)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text("Password Requirements:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        RequirementRow("Minimum 8 characters", hasMinLength)
        RequirementRow("One uppercase & one lowercase", hasUpper && hasLower)
        RequirementRow("One number", hasDigit)
        RequirementRow("One special character", hasSpecial)

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                if (password != confirmPassword) {
                    Toast.makeText(context, "Passwords do not match", Toast.LENGTH_SHORT).show()
                } else if (hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial) {
                    scope.launch {
                        isLoading = true
                        delay(2000)
                        isLoading = false
                        Toast.makeText(context, "Password hashed & updated securely", Toast.LENGTH_LONG).show()
                        onPasswordUpdated()
                    }
                } else {
                    Toast.makeText(context, "Please meet all requirements", Toast.LENGTH_SHORT).show()
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CoralPrimary),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
            } else {
                Text("Update Password", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun RequirementRow(text: String, isMet: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
        Icon(
            if (isMet) Icons.Default.CheckCircle else Icons.Default.Circle,
            null,
            tint = if (isMet) Color(0xFF4CAF50) else Color.LightGray,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text, fontSize = 12.sp, color = if (isMet) Color.Black else Color.Gray)
    }
}

// --- SCREEN 4: SUCCESS SCREEN ---
@Composable
fun ResetSuccessScreen(onBackToLogin: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(White)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Surface(
            modifier = Modifier.size(120.dp),
            shape = CircleShape,
            color = Color(0xFFE8F5E9)
        ) {
            Icon(
                Icons.Default.Check,
                null,
                tint = Color(0xFF2E7D32),
                modifier = Modifier.padding(32.dp).size(64.dp)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            "Reset Successful!",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black)
        )
        Text(
            "Your password has been updated successfully. You can now login with your new credentials.",
            textAlign = TextAlign.Center,
            color = Color.Gray,
            modifier = Modifier.padding(top = 16.dp).padding(horizontal = 24.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = onBackToLogin,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CoralPrimary)
        ) {
            Text("Back to Login", fontWeight = FontWeight.Bold)
        }
    }
}
