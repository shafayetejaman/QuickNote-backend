export default interface UserInterface {
    username: string
    fullName: string
    email: string
    password: string
    profileImageUrl?: string
    refreshToken?: string
    role: "admin" | "inactive" | "deactivated" | "active"
    activationToken?: { token: string; expiresAt: Date }
    isPasswordMatch: (password: string) => Promise<boolean>
    generateAccessToken: () => Promise<string>
    generateRefreshToken: () => Promise<string>
    generateActivationToken: () => Promise<{
        token: string
        expiresAt: Date
    }>
    extractData: () => UserInterface
    save: () => null
}
