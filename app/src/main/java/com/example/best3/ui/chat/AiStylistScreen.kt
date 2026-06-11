package com.example.best3.ui.chat

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun AiStylistScreenPreview() {
    StyleAiTheme {
        AiStylistScreen(onBackClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiStylistScreen(
    onBackClick: () -> Unit,
    viewModel: AiStylistViewModel = viewModel()
) {
    var messageText by remember { mutableStateOf("") }
    val messages = viewModel.messages

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(modifier = Modifier.size(32.dp), shape = CircleShape, color = AccentBlue.copy(alpha = 0.1f)) {
                            Icon(Icons.Default.AutoAwesome, null, modifier = Modifier.size(16.dp).padding(4.dp), tint = AccentBlue)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Style AI Assistant", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
        ) {
            LazyColumn(
                modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                items(messages) { message ->
                    ChatBubble(message)
                }
            }

            // Input Area
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 8.dp,
                color = White,
                shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Sensitive skin wear?", "Best fabric for dermatitis?", "Korean casual outfit?", "Summer recs?").forEach { prompt ->
                            SuggestionChip(
                                onClick = { messageText = prompt },
                                label = { Text(prompt, fontSize = 12.sp) },
                                colors = SuggestionChipDefaults.suggestionChipColors(containerColor = LightBlue.copy(alpha = 0.2f), labelColor = AccentBlue),
                                border = null,
                                shape = RoundedCornerShape(12.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        IconButton(
                            onClick = { },
                            modifier = Modifier.background(SoftGray, CircleShape)
                        ) {
                            Icon(Icons.Default.Mic, null, tint = AccentBlue)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                                .clip(RoundedCornerShape(28.dp))
                                .background(SoftGray)
                                .padding(horizontal = 16.dp)
                        ) {
                            TextField(
                                value = messageText,
                                onValueChange = { messageText = it },
                                placeholder = { Text("Ask Style AI...", color = Color.Gray) },
                                modifier = Modifier.weight(1f),
                                textStyle = LocalTextStyle.current.copy(color = Color.Black, fontWeight = FontWeight.Bold),
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = Color.Transparent,
                                    unfocusedContainerColor = Color.Transparent,
                                    focusedIndicatorColor = Color.Transparent,
                                    unfocusedIndicatorColor = Color.Transparent,
                                    focusedTextColor = Color.Black,
                                    unfocusedTextColor = Color.Black
                                )
                            )
                            IconButton(
                                onClick = {
                                    if (messageText.isNotBlank()) {
                                        viewModel.sendMessage(messageText)
                                        messageText = ""
                                    }
                                },
                                modifier = Modifier.size(40.dp).background(AccentBlue, CircleShape)
                            ) {
                                Icon(Icons.AutoMirrored.Filled.Send, null, tint = White, modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (message.isAi) Alignment.Start else Alignment.End
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 20.dp,
                topEnd = 20.dp,
                bottomStart = if (message.isAi) 4.dp else 20.dp,
                bottomEnd = if (message.isAi) 20.dp else 4.dp
            ),
            color = if (message.isAi) White else LightBlue,
            border = BorderStroke(1.dp, if (message.isAi) LightBlue.copy(alpha = 0.5f) else AccentBlue.copy(alpha = 0.3f)),
            shadowElevation = 1.dp
        ) {
            if (message.isLoading) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(12.dp)) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = AccentBlue, strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(message.text, fontSize = 14.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                }
            } else {
                Text(
                    text = message.text,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    color = Color.Black, // Every word is now strictly Black
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        if (message.isAi && message.suggestedOutfits != null) {
            Spacer(modifier = Modifier.height(12.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(message.suggestedOutfits) { outfit ->
                    Card(
                        modifier = Modifier.width(180.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = White),
                        border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f))
                    ) {
                        Column {
                            AsyncImage(
                                model = outfit.image,
                                contentDescription = null,
                                modifier = Modifier.height(140.dp).fillMaxWidth(),
                                contentScale = ContentScale.Crop,
                                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                            )
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(outfit.name, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color.Black)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.HealthAndSafety, null, tint = Color(0xFF4CAF50), modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("${outfit.safetyScore}% Safe", fontSize = 12.sp, color = Color(0xFF4CAF50))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
