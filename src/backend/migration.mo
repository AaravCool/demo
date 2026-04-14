// Migration: ADMIN_PRINCIPAL (Text) -> adminPrincipalRef ({ var value : Text })
// The old actor stored the admin principal as a plain stable Text field.
// The new actor stores it as a { var value : Text } wrapper for mixin sharing.
module {
  type OldActor = {
    ADMIN_PRINCIPAL : Text;
  };

  type NewActor = {
    adminPrincipalRef : { var value : Text };
  };

  public func run(old : OldActor) : NewActor {
    { adminPrincipalRef = { var value = old.ADMIN_PRINCIPAL } }
  };
};
