package com.example.best3.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.address.AddressManagementScreen
import com.example.best3.ui.cart.*
import com.example.best3.ui.chat.*
import com.example.best3.ui.home.*
import com.example.best3.ui.login.*
import com.example.best3.ui.notifications.NotificationsScreen
import com.example.best3.ui.onboarding.screens.*
import com.example.best3.ui.payment.PaymentMethodsScreen
import com.example.best3.ui.product.ProductDetailsScreen
import com.example.best3.ui.profile.*
import com.example.best3.ui.search.SearchScreen
import com.example.best3.ui.splash.SplashScreen
import com.example.best3.ui.wishlist.*

sealed class Screen(val route: String) {
    // Auth & Onboarding
    object Splash : Screen("splash")
    object AuthSelection : Screen("auth_selection")
    object GoogleCredential : Screen("google_credential/{email}") {
        fun createRoute(email: String) = "google_credential/$email"
    }
    object WelcomeBack : Screen("welcome_back")
    object EmailVerify : Screen("email_verify")
    object PersonalInfo : Screen("personal_info")
    object SkinComfort : Screen("skin_comfort")
    object SkinDiagnosis : Screen("skin_diagnosis")
    object AiLoading : Screen("ai_loading")
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object ForgotPassword : Screen("forgot_password")
    object OtpVerifyReset : Screen("otp_verify_reset/{email}") {
        fun createRoute(email: String) = "otp_verify_reset/$email"
    }
    object CreateNewPassword : Screen("create_new_password/{email}") {
        fun createRoute(email: String) = "create_new_password/$email"
    }
    object ResetSuccess : Screen("reset_success")

    // Main App Features
    object Home : Screen("home")
    object Search : Screen("search")
    object Wishlist : Screen("wishlist")
    object SavedItems : Screen("saved_items")
    object Cart : Screen("cart")
    object Checkout : Screen("checkout/{productName}") {
        fun createRoute(productName: String) = "checkout/$productName"
    }
    object PaymentSuccess : Screen("payment_success/{productName}") {
        fun createRoute(productName: String) = "payment_success/$productName"
    }
    
    // User Profile & Settings
    object Profile : Screen("profile")
    object MyOrders : Screen("my_orders")
    object OrderTracking : Screen("order_tracking/{productName}") {
        fun createRoute(productName: String) = "order_tracking/$productName"
    }
    object OrderHistory : Screen("order_history")
    object Rewards : Screen("rewards")
    object Settings : Screen("settings")
    object SettingsPrivacy : Screen("settings_privacy")
    object PaymentMethods : Screen("payment_methods")
    object DeliveryAddress : Screen("delivery_address")
    object SizeRecommendation : Screen("size_recommendation")
    object EditProfile : Screen("edit_profile")
    object SkinPreferences : Screen("skin_preferences")
    object SkinComfortDiary : Screen("skin_comfort_diary")
    
    // AI & Specialized Tools
    object AiStylist : Screen("ai_stylist")
    object VirtualCloset : Screen("virtual_closet")
    object LabelLens : Screen("label_lens")
    object FabricEncyclopedia : Screen("fabric_encyclopedia")
    object SustainabilityDashboard : Screen("sustainability_dashboard")
    object WashCareGuide : Screen("wash_care_guide")

    // Shopping Categories
    object Category : Screen("category/{categoryName}") {
        fun createRoute(categoryName: String) = "category/$categoryName"
    }
    object ProductDetails : Screen("product_details/{productName}") {
        fun createRoute(productName: String) = "product_details/$productName"
    }
    object Notifications : Screen("notifications")
}

@Composable
fun StyleAiNavGraph(startDestination: String = Screen.Splash.route) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = { fadeIn(animationSpec = tween(500)) + slideInHorizontally(initialOffsetX = { 1000 }) },
        exitTransition = { fadeOut(animationSpec = tween(500)) + slideOutHorizontally(targetOffsetX = { -1000 }) },
        popEnterTransition = { fadeIn(animationSpec = tween(500)) + slideInHorizontally(initialOffsetX = { -1000 }) },
        popExitTransition = { fadeOut(animationSpec = tween(500)) + slideOutHorizontally(targetOffsetX = { 1000 }) }
    ) {
        // --- SPLASH & AUTH ---
        composable(Screen.Splash.route) {
            SplashScreen(onFinished = {
                val currentUser = FirebaseManager.currentUser
                when {
                    currentUser == null -> {
                        navController.navigate(Screen.AuthSelection.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                    !currentUser.isEmailVerified -> {
                        navController.navigate(Screen.EmailVerify.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                    else -> {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                }
            })
        }

        composable(Screen.AuthSelection.route) {
            AuthSelectionScreen(
                onLoginClick = { navController.navigate(Screen.Login.route) },
                onSignUpClick = { navController.navigate(Screen.SignUp.route) },
                onGoogleClick = { email ->
                    navController.navigate(Screen.GoogleCredential.createRoute(email))
                }
            )
        }

        composable(Screen.GoogleCredential.route) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            GoogleCredentialScreen(
                selectedEmail = email,
                onBackClick = { navController.popBackStack() },
                onNext = {
                    navController.navigate(Screen.WelcomeBack.route) {
                        popUpTo(Screen.GoogleCredential.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.WelcomeBack.route) {
            WelcomeBackScreen(onContinue = {
                navController.navigate(Screen.EmailVerify.route) {
                    popUpTo(Screen.WelcomeBack.route) { inclusive = true }
                }
            })
        }

        composable(Screen.EmailVerify.route) {
            EmailVerificationScreen(onVerifySuccess = {
                navController.navigate(Screen.PersonalInfo.route)
            })
        }

        // --- SETUP FLOW ---
        composable(Screen.PersonalInfo.route) {
            PersonalInfoSetupScreen(onContinue = {
                navController.navigate(Screen.SkinDiagnosis.route)
            })
        }

        composable(Screen.SkinDiagnosis.route) {
            SkinDiagnosisSetupScreen(onAnalyze = {
                navController.navigate(Screen.SkinComfort.route)
            })
        }

        composable(Screen.SkinComfort.route) {
            SkinComfortScreen(onContinue = {
                navController.navigate(Screen.AiLoading.route)
            })
        }

        composable(Screen.AiLoading.route) {
            AiLoadingScreen(onFinished = {
                navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            })
        }
        
        // --- LOGIN / SIGNUP ---
        composable(Screen.Login.route) {
            LoginScreen(
                onBackClick = { navController.popBackStack() },
                onLoginSuccess = { isEmailVerified, isProfileComplete ->
                    val destination = when {
                        !isEmailVerified -> Screen.EmailVerify.route
                        !isProfileComplete -> Screen.PersonalInfo.route
                        else -> Screen.AiLoading.route
                    }
                    navController.navigate(destination) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onGoogleClick = { email ->
                    navController.navigate(Screen.GoogleCredential.createRoute(email))
                },
                onSignUpClick = {
                    navController.navigate(Screen.SignUp.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onForgotPasswordClick = {
                    navController.navigate(Screen.ForgotPassword.route)
                }
            )
        }

        composable(Screen.SignUp.route) {
            SignUpScreen(
                onBackClick = { navController.popBackStack() },
                onSignUpSuccess = {
                    navController.navigate(Screen.EmailVerify.route) {
                        popUpTo(Screen.SignUp.route) { inclusive = true }
                    }
                },
                onLoginClick = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.SignUp.route) { inclusive = true }
                    }
                },
                onGoogleClick = { email ->
                    navController.navigate(Screen.GoogleCredential.createRoute(email))
                }
            )
        }

        // --- PASSWORD RESET ---
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBackClick = { navController.popBackStack() },
                onCodeSent = { email ->
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.ForgotPassword.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.ResetSuccess.route) {
            ResetSuccessScreen(onBackToLogin = {
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.ForgotPassword.route) { inclusive = true }
                }
            })
        }

        // --- DASHBOARD & SEARCH ---
        composable(Screen.Home.route) {
            HomeDashboard(
                onProductClick = { productName ->
                    navController.navigate(Screen.ProductDetails.createRoute(productName))
                },
                onAiStylistClick = { navController.navigate(Screen.AiStylist.route) },
                onCategoryClick = { categoryName ->
                    when (categoryName) {
                        "FabricEncyclopedia" -> navController.navigate(Screen.FabricEncyclopedia.route)
                        "SustainabilityDashboard" -> navController.navigate(Screen.SustainabilityDashboard.route)
                        "VirtualCloset" -> navController.navigate(Screen.VirtualCloset.route)
                        else -> navController.navigate(Screen.Category.createRoute(categoryName))
                    }
                },
                onProfileClick = { navController.navigate(Screen.Profile.route) },
                onSearchClick = { navController.navigate(Screen.Search.route) },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) },
                onCartClick = { navController.navigate(Screen.Cart.route) },
                onNotificationClick = { navController.navigate(Screen.Notifications.route) },
                onTrackOrderClick = {
                    navController.navigate(Screen.OrderTracking.createRoute("Azure Linen Shirt"))
                },
                onLabelLensClick = { navController.navigate(Screen.LabelLens.route) },
                onWashCareClick = { navController.navigate(Screen.WashCareGuide.route) }
            )
        }

        composable(Screen.Search.route) {
            SearchScreen(
                onBackClick = { navController.popBackStack() },
                onProductClick = { productName ->
                    navController.navigate(Screen.ProductDetails.createRoute(productName))
                },
                onHomeClick = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) },
                onProfileClick = { navController.navigate(Screen.Profile.route) },
                onCategoryClick = { categoryName ->
                    navController.navigate(Screen.Category.createRoute(categoryName))
                }
            )
        }

        // --- WISHLIST & CART ---
        composable(Screen.Wishlist.route) {
            WishlistScreen(
                onBackClick = { navController.popBackStack() },
                onProductClick = { productName ->
                    navController.navigate(Screen.ProductDetails.createRoute(productName))
                },
                onHomeClick = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onSearchClick = { navController.navigate(Screen.Search.route) },
                onProfileClick = { navController.navigate(Screen.Profile.route) }
            )
        }

        composable(Screen.SavedItems.route) {
            SavedItemsScreen(
                onBackClick = { navController.popBackStack() },
                onProductClick = { productName ->
                    navController.navigate(Screen.ProductDetails.createRoute(productName))
                }
            )
        }

        composable(Screen.Cart.route) {
            CartScreen(
                onBackClick = { navController.popBackStack() },
                onCheckoutClick = { navController.navigate(Screen.Checkout.route) }
            )
        }

        composable(Screen.Checkout.route) { backStackEntry ->
            val productName = backStackEntry.arguments?.getString("productName") ?: "Azure Linen Shirt"
            CheckoutScreen(
                productName = productName,
                onBackClick = { navController.popBackStack() },
                onOrderPlaced = {
                    navController.navigate(Screen.PaymentSuccess.createRoute(productName)) {
                        popUpTo(Screen.Cart.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.PaymentSuccess.route) { backStackEntry ->
            val productName = backStackEntry.arguments?.getString("productName") ?: "Azure Linen Shirt"
            PaymentSuccessScreen(
                productName = productName,
                onTrackOrderClick = {
                    navController.navigate(Screen.OrderTracking.createRoute(productName)) {
                        popUpTo(Screen.PaymentSuccess.route) { inclusive = true }
                    }
                },
                onContinueShoppingClick = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = false }
                    }
                }
            )
        }

        // --- PROFILE & SETTINGS ---
        composable(Screen.Profile.route) {
            ProfileScreen(
                onBackClick = { navController.popBackStack() },
                onAiStylistClick = { navController.navigate(Screen.AiStylist.route) },
                onLogout = {
                    navController.navigate(Screen.AuthSelection.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onSettingsClick = { navController.navigate(Screen.Settings.route) },
                onOrdersClick = { navController.navigate(Screen.OrderHistory.route) },
                onSizeRecommendationClick = { navController.navigate(Screen.SizeRecommendation.route) },
                onPaymentMethodsClick = { navController.navigate(Screen.PaymentMethods.route) },
                onDeliveryAddressClick = { navController.navigate(Screen.DeliveryAddress.route) },
                onEditProfileClick = { navController.navigate(Screen.EditProfile.route) },
                onSkinPreferencesClick = { navController.navigate(Screen.SkinPreferences.route) },
                onSettingsPrivacyClick = { navController.navigate(Screen.SettingsPrivacy.route) },
                onHomeClick = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onSearchClick = { navController.navigate(Screen.Search.route) },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) },
                onSkinComfortDiaryClick = { navController.navigate(Screen.SkinComfortDiary.route) },
                onVirtualClosetClick = { navController.navigate(Screen.VirtualCloset.route) },
                onSavedItemsClick = { navController.navigate(Screen.SavedItems.route) },
                onRewardsClick = { navController.navigate(Screen.Rewards.route) }
            )
        }

        composable(Screen.OrderHistory.route) {
            MyOrdersScreen(
                onBackClick = { navController.popBackStack() },
                onOrderClick = { orderId ->
                    val productName = if (orderId == "#ST67890") "Azure Linen Shirt" else "Organic Cotton Hoodie"
                    navController.navigate(Screen.OrderTracking.createRoute(productName))
                }
            )
        }

        composable(Screen.OrderTracking.route) { backStackEntry ->
            val productName = backStackEntry.arguments?.getString("productName") ?: "Azure Linen Shirt"
            val goHome = {
                navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Home.route) { inclusive = true }
                }
            }
            OrderTrackingScreen(
                productName = productName,
                onBackClick = goHome,
                onCompleteClick = goHome
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.SettingsPrivacy.route) {
            SettingsPrivacyScreen(
                onBackClick = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Screen.AuthSelection.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // --- SPECIALIZED FEATURES ---
        composable(Screen.AiStylist.route) {
            AiStylistScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.FabricEncyclopedia.route) {
            FabricEncyclopediaScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.SustainabilityDashboard.route) {
            SustainabilityDashboardScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.SkinComfortDiary.route) {
            SkinComfortDiaryScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.VirtualCloset.route) {
            VirtualClosetScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.LabelLens.route) {
            LabelLensScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.WashCareGuide.route) {
            WashCareGuideScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.Rewards.route) {
            RewardsScreen(onBackClick = { navController.popBackStack() })
        }

        // --- PRODUCT & CATEGORY ---
        composable(Screen.Category.route) { backStackEntry ->
            val categoryName = backStackEntry.arguments?.getString("categoryName") ?: "Summer"
            val category = try {
                StyleCategory.valueOf(categoryName)
            } catch (e: Exception) {
                StyleCategory.Summer
            }
            CategoryScreen(
                initialCategory = category,
                onBackClick = { navController.popBackStack() },
                onProductClick = { productName ->
                    navController.navigate(Screen.ProductDetails.createRoute(productName))
                },
                onAiStylistClick = { navController.navigate(Screen.AiStylist.route) },
                onProfileClick = { navController.navigate(Screen.Profile.route) },
                onSearchClick = { navController.navigate(Screen.Search.route) },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) }
            )
        }

        composable(Screen.ProductDetails.route) { backStackEntry ->
            val productName = backStackEntry.arguments?.getString("productName") ?: "Product"
            ProductDetailsScreen(
                productName = productName,
                onBackClick = { navController.popBackStack() },
                onBuyNowClick = {
                    navController.navigate(Screen.Checkout.createRoute(productName))
                }
            )
        }

        composable(Screen.Notifications.route) {
            NotificationsScreen(onBackClick = { navController.popBackStack() })
        }
        
        composable(Screen.PaymentMethods.route) {
            PaymentMethodsScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.DeliveryAddress.route) {
            AddressManagementScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.SizeRecommendation.route) {
            SizeRecommendationScreen(onBackClick = { navController.popBackStack() })
        }

        composable(Screen.EditProfile.route) {
            EditProfileScreen(
                onBackClick = { navController.popBackStack() },
                onSaveClick = { navController.popBackStack() }
            )
        }

        composable(Screen.SkinPreferences.route) {
            SkinPreferencesScreen(
                onBackClick = { navController.popBackStack() },
                onSaveClick = { navController.popBackStack() }
            )
        }
    }
}
