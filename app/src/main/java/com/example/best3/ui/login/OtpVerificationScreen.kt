package com.example.best3.ui.login

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun OtpVerificationScreenPreview() {
    StyleAiTheme {
        OtpVerificationScreen(onBackClick = {}, onVerifySuccess = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OtpVerificationScreen(onBackClick: () -> Unit, onVerifySuccess: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var otpValues = remember { mutableStateListOf("", "", "", "") }
    var timer by remember { mutableIntStateOf(59) }
    var isLoading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (timer > 0) {
            delay(1000)
            timer--
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("OTP Verification", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = AccentBlue)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(40.dp))
                
                Surface(
                    modifier = Modifier.size(100.dp),
                    shape = CircleShape,
                    color = LightBlue.copy(alpha = 0.3f)
                ) {
                    Icon(
                        Icons.Default.VpnKey, 
                        null, 
                        tint = AccentBlue, 
                        modifier = Modifier.padding(24.dp).size(48.dp)
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                Text(
                    "Verification Code",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black, color = Color.Black)
                )
                Text(
                    "We have sent a 4-digit code to your mobile number and email.",
                    textAlign = TextAlign.Center,
                    color = Color.Gray,
                    modifier = Modifier.padding(top = 8.dp).padding(horizontal = 24.dp)
                )

                Spacer(modifier = Modifier.height(48.dp))

                // OTP Input Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally)
                ) {
                    otpValues.forEachIndexed { index, value ->
                        OutlinedTextField(
                            value = value,
                            onValueChange = {
                                if (it.length <= 1) {
                                    otpValues[index] = it
                                }
                            },
                            modifier = Modifier.size(64.dp),
                            textStyle = LocalTextStyle.current.copy(
                                textAlign = TextAlign.Center,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.Black
                            ),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentBlue,
                                unfocusedBorderColor = Color.LightGray,
                                focusedContainerColor = White,
                                unfocusedContainerColor = White,
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))

                if (timer > 0) {
                    Text(
                        text = "Resend code in 00:${timer.toString().padStart(2, '0')}",
                        color = Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                } else {
                    TextButton(onClick = { timer = 59 }) {
                        Text("Resend OTP", color = AccentBlue, fontWeight = FontWeight.Black)
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = {
                        if (otpValues.any { it.isBlank() }) {
                            Toast.makeText(context, "Please enter all 4 digits", Toast.LENGTH_SHORT).show()
                        } else {
                            scope.launch {
                                isLoading = true
                                delay(1500)
                                isLoading = false
                                Toast.makeText(context, "OTP Verified!", Toast.LENGTH_SHORT).show()
                                onVerifySuccess()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(60.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                    enabled = !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = White, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Verify & Continue", fontWeight = FontWeight.Black, fontSize = 18.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
