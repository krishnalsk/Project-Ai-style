package com.example.best3.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.IgnoreExtraProperties
import kotlinx.coroutines.tasks.await

@IgnoreExtraProperties
data class UserProfile(
    val email: String? = null,
    val fullName: String? = null,
    val profession: String? = null,
    val age: String? = null,
    val size: String? = null,
    val skinType: String? = null,
    val preferredFabric: String? = null,
    val location: String? = null,
    val comfortScore: Int = 92
)

object FirebaseManager {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("users")

    var tempProfile = UserProfile()

    val currentUser get() = auth.currentUser

    fun isUserLoggedIn(): Boolean = auth.currentUser != null

    fun logout() {
        auth.signOut()
    }

    suspend fun deleteUserAccount(): Result<Unit> {
        val user = auth.currentUser ?: return Result.failure(Exception("User not logged in"))
        val userId = user.uid
        
        return try {
            // 1. Delete Firestore Data
            usersCollection.document(userId).delete().await()
            // 2. Delete Auth Account
            user.delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signInWithGoogle(idToken: String): Result<Unit> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            auth.signInWithCredential(credential).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveUserProfile(profile: UserProfile): Result<Unit> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            usersCollection.document(userId).set(profile).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserProfile(): Result<UserProfile?> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            val snapshot = usersCollection.document(userId).get().await()
            Result.success(snapshot.toObject(UserProfile::class.java))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
