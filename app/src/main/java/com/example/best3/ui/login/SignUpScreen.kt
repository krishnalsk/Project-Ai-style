package com.example.best3.ui.login

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.google.firebase.auth.FirebaseAuth
import com.example.best3.ui.theme.*
import com.example.best3.data.FirebaseManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.launch
import com.example.best3.R

@Preview(showBackground = true)
@Composable
fun SignUpScreenPreview() {
    StyleAiTheme {
        SignUpScreen(
            onBackClick = {},
            onSignUpSuccess = {},
            onLoginClick = {},
            onGoogleClick = {}
        )
    }
}

@Composable
fun SignUpScreen(
    onBackClick: () -> Unit, 
    onSignUpSuccess: () -> Unit, 
    onLoginClick: () -> Unit,
    onGoogleClick: (String) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val auth = FirebaseAuth.getInstance()
    
    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                account?.idToken?.let { idToken ->
                    scope.launch {
                        isLoading = true
                        val loginResult = FirebaseManager.signInWithGoogle(idToken)
                        isLoading = false
                        if (loginResult.isSuccess) {
                            onGoogleClick(account.email ?: "")
                        }
                    }
                }
            } catch (e: ApiException) {
                Toast.makeText(context, "Google Sign-In failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(White, LightBlue)))
    ) {
        IconButton(
            onClick = onBackClick,
            modifier = Modifier
                .padding(16.dp)
                .align(Alignment.TopStart)
                .background(White.copy(alpha = 0.5f), CircleShape)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AccentBlue)
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(
                visible = visible,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn()
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = stringResource(R.string.create_account),
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.Black
                        )
                    )
                    Text(
                        text = stringResource(R.string.signup_subtitle),
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.Gray, fontWeight = FontWeight.Medium)
                    )

                    Spacer(modifier = Modifier.height(40.dp))

                    if (errorMessage != null) {
                        Text(errorMessage!!, color = Color.Red, modifier = Modifier.padding(bottom = 16.dp))
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .background(White.copy(alpha = 0.6f))
                            .border(
                                1.dp,
                                Brush.linearGradient(listOf(White.copy(alpha = 0.8f), White.copy(alpha = 0.2f))),
                                RoundedCornerShape(24.dp)
                            )
                            .padding(24.dp)
                    ) {
                        Column {
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text(stringResource(R.string.email_address), color = Color.Black) },
                                leadingIcon = { Icon(Icons.Default.Email, null, tint = AccentBlue) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AccentBlue,
                                    unfocusedBorderColor = Color.LightGray,
                                    focusedTextColor = Color.Black,
                                    unfocusedTextColor = Color.Black
                                ),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text(stringResource(R.string.password), color = Color.Black) },
                                leadingIcon = { Icon(Icons.Default.Lock, null, tint = AccentBlue) },
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                            tint = Color.Gray
                                        )
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
                                visualTransformation = if (passwordVisible) androidx.compose.ui.text.input.VisualTransformation.None else PasswordVisualTransformation(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AccentBlue,
                                    unfocusedBorderColor = Color.LightGray,
                                    focusedTextColor = Color.Black,
                                    unfocusedTextColor = Color.Black
                                )
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            Button(
                                onClick = {
                                    if (email.isNotBlank() && password.isNotBlank()) {
                                        isLoading = true
                                        auth.createUserWithEmailAndPassword(email.trim(), password)
                                            .addOnCompleteListener { task ->
                                                if (task.isSuccessful) {
                                                    // Send Real Email Verification
                                                    val user = auth.currentUser
                                                    user?.sendEmailVerification()
                                                        ?.addOnCompleteListener { verifyTask ->
                                                            isLoading = false
                                                            if (verifyTask.isSuccessful) {
                                                                Toast.makeText(context, "Verification email sent to ${user.email}. Check your inbox/spam.", Toast.LENGTH_LONG).show()
                                                                onSignUpSuccess()
                                                            } else {
                                                                errorMessage = "Created account but failed to send verification email: ${verifyTask.exception?.message}"
                                                                Toast.makeText(context, errorMessage, Toast.LENGTH_LONG).show()
                                                            }
                                                        }
                                                } else {
                                                    isLoading = false
                                                    errorMessage = task.exception?.message ?: "Sign up failed"
                                                }
                                            }
                                    } else {
                                        errorMessage = "Please fill all fields"
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                                enabled = !isLoading
                            ) {
                                if (isLoading) {
                                    CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
                                } else {
                                    Text(stringResource(R.string.create_my_account), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Icon(Icons.AutoMirrored.Outlined.ArrowForward, null)
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                HorizontalDivider(modifier = Modifier.weight(1f), color = Color.LightGray.copy(alpha = 0.5f))
                                Text(" " + stringResource(R.string.or_divider) + " ", color = Color.Gray, fontSize = 12.sp)
                                HorizontalDivider(modifier = Modifier.weight(1f), color = Color.LightGray.copy(alpha = 0.5f))
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Surface(
                                onClick = {
                                    onGoogleClick("balamurali@gmail.com")
                                },
                                modifier = Modifier.fillMaxWidth().height(56.dp),
                                shape = RoundedCornerShape(12.dp),
                                color = White,
                                border = BorderStroke(1.dp, Color.LightGray),
                                shadowElevation = 1.dp
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxSize(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Icon(Icons.Default.GTranslate, null, tint = Color.Unspecified, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(stringResource(R.string.continue_with_google), fontWeight = FontWeight.Bold, color = Color.Black)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    Row {
                        Text(stringResource(R.string.already_have_account), color = Color.Gray, fontWeight = FontWeight.Medium)
                        Text(
                            text = " " + stringResource(R.string.log_in),
                            color = Color.Black,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier
                                .padding(start = 4.dp)
                                .clickable { onLoginClick() }
                        )
                    }
                }
            }
        }
    }
}
