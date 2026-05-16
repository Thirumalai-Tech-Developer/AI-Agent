
def key_router(current_value):
    """
    This functiobn is used to route the API keys to maintain Free tier limits
    """
    if current_value  <= 10:
        return current_value + 1
    else:
        return 1