# core/forms.py
from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError

User = get_user_model()

class UserCreationForm(forms.ModelForm):
    """
    Admin에서 사용자 생성할 때 사용하는 폼.
    password1/password2 확인, set_password 적용.
    """
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput, strip=False)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput, strip=False)

    class Meta:
        model = User
        fields = ("tenant", "email", "full_name", "role", "is_staff", "is_active")

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """
    Admin에서 사용자 수정할 때 사용하는 폼.
    비밀번호는 read-only 해시로 보여줌.
    """
    password = ReadOnlyPasswordHashField(label="Password")

    class Meta:
        model = User
        fields = ("tenant", "email", "full_name", "password", "role", "is_active", "is_staff", "is_superuser")

    def clean_password(self):
        # 언제나 해시값 그대로 반환
        return self.initial["password"]
